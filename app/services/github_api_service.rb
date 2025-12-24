# frozen_string_literal: true

require "net/http"
require "json"

class GithubApiService
  PERSONAL_ACCOUNT = "rz1989s"
  API_BASE_URL = "https://api.github.com"

  def initialize
    @http_options = {
      "Accept" => "application/vnd.github.v3+json",
      "User-Agent" => "RECTOR-LABS-CORE"
    }
    # Add GitHub token if available for higher rate limits
    @http_options["Authorization"] = "token #{ENV['GITHUB_TOKEN']}" if ENV["GITHUB_TOKEN"]
    @discovered_orgs = nil
  end

  # Dynamically discover all organizations the user belongs to
  # Uses authenticated /user/orgs endpoint to get ALL orgs (including private memberships)
  def discover_organizations
    return @discovered_orgs if @discovered_orgs

    # Use authenticated endpoint for all orgs (public + private memberships)
    # Falls back to public endpoint if no token
    uri = if ENV["GITHUB_TOKEN"].present?
      URI("#{API_BASE_URL}/user/orgs")
    else
      URI("#{API_BASE_URL}/users/#{PERSONAL_ACCOUNT}/orgs")
    end

    orgs = fetch_json(uri)

    @discovered_orgs = orgs.map { |org| org[:login] }
    Rails.logger.info "Discovered #{@discovered_orgs.size} organizations: #{@discovered_orgs.join(', ')}"
    @discovered_orgs
  rescue StandardError => e
    Rails.logger.error "Failed to discover organizations: #{e.message}"
    @discovered_orgs = []
  end

  # Get all accounts (personal + all orgs)
  def all_accounts
    [ PERSONAL_ACCOUNT ] + discover_organizations
  end

  # Fetch latest projects from personal and ALL discovered org accounts
  # Returns array of repo hashes sorted by latest commit
  def fetch_latest_projects(limit: 6)
    all_repos = []

    all_accounts.each do |account|
      all_repos.concat(fetch_repos_for_account(account))
    end

    all_repos
      .sort_by { |repo| repo[:pushed_at] }
      .reverse
      .take(limit)
  end

  # Fetch all repositories for tech stack parsing
  def fetch_all_repos
    all_repos = []

    all_accounts.each do |account|
      all_repos.concat(fetch_repos_for_account(account))
    end

    all_repos
  end

  private

  # Generic JSON fetcher for GitHub API
  def fetch_json(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri)
    @http_options.each { |key, value| request[key] = value }

    response = http.request(request)

    if response.code == "200"
      JSON.parse(response.body, symbolize_names: true)
    else
      Rails.logger.error "GitHub API error: #{response.code} - #{uri}"
      []
    end
  end

  def fetch_repos_for_account(account)
    uri = URI("#{API_BASE_URL}/users/#{account}/repos?per_page=100&sort=pushed")

    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      request = Net::HTTP::Get.new(uri)
      @http_options.each { |key, value| request[key] = value }

      response = http.request(request)

      # Check rate limit headers
      rate_limit_remaining = response["X-RateLimit-Remaining"].to_i
      rate_limit_reset = Time.at(response["X-RateLimit-Reset"].to_i) if response["X-RateLimit-Reset"]

      if rate_limit_remaining < 10
        Rails.logger.warn "GitHub API rate limit low: #{rate_limit_remaining} requests remaining until #{rate_limit_reset}"
      end

      if response.code == "403" && rate_limit_remaining == 0
        Rails.logger.error "GitHub API rate limit exceeded. Resets at #{rate_limit_reset}"
        return []
      end

      if response.code == "200"
        repos = JSON.parse(response.body, symbolize_names: true)
        parse_repos(repos, account)
      else
        Rails.logger.error "GitHub API error for #{account}: #{response.code} - #{response.body[0..500]}"
        []
      end
    rescue StandardError => e
      Rails.logger.error "GitHub API exception for #{account}: #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")
      []
    end
  end

  def parse_repos(repos, account)
    repos.map do |repo|
      commit_info = fetch_commit_info(repo[:full_name])
      {
        name: repo[:name],
        full_name: repo[:full_name],
        description: repo[:description],
        html_url: repo[:html_url],
        language: repo[:language],
        stargazers_count: repo[:stargazers_count],
        forks_count: repo[:forks_count],
        pushed_at: Time.parse(repo[:pushed_at]),
        created_at: Time.parse(repo[:created_at]),
        updated_at: Time.parse(repo[:updated_at]),
        topics: repo[:topics] || [],
        is_fork: repo[:fork],
        account: account,
        commit_count: commit_info[:count],
        latest_commit_sha: commit_info[:sha]
      }
    end
  end

  # Fetch commit count and latest commit sha for a repo
  def fetch_commit_info(full_name)
    uri = URI("#{API_BASE_URL}/repos/#{full_name}/commits?per_page=1")

    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      request = Net::HTTP::Get.new(uri)
      @http_options.each { |key, value| request[key] = value }

      response = http.request(request)

      if response.code == "200"
        commits = JSON.parse(response.body, symbolize_names: true)
        latest_sha = commits.first&.dig(:sha)&.slice(0, 7)

        # Parse commit count from Link header (last page number)
        commit_count = parse_commit_count_from_link(response["Link"])

        { sha: latest_sha, count: commit_count }
      else
        { sha: nil, count: nil }
      end
    rescue StandardError => e
      Rails.logger.error "Failed to fetch commit info for #{full_name}: #{e.message}"
      { sha: nil, count: nil }
    end
  end

  # Parse total commit count from GitHub's Link header pagination
  def parse_commit_count_from_link(link_header)
    return nil unless link_header

    # Link header format: <url?page=N>; rel="last"
    last_match = link_header.match(/page=(\d+)>; rel="last"/)
    last_match ? last_match[1].to_i : 1
  end
end
