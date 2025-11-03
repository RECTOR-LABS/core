# frozen_string_literal: true

require "net/http"
require "json"

class GithubApiService
  PERSONAL_ACCOUNT = "rz1989s"
  ORG_ACCOUNT = "RECTOR-LABS"
  API_BASE_URL = "https://api.github.com"

  def initialize
    @http_options = {
      "Accept" => "application/vnd.github.v3+json",
      "User-Agent" => "RECTOR-LABS-CORE"
    }
    # Add GitHub token if available for higher rate limits
    @http_options["Authorization"] = "token #{ENV['GITHUB_TOKEN']}" if ENV["GITHUB_TOKEN"]
  end

  # Fetch latest projects from both personal and org accounts
  # Returns array of repo hashes sorted by latest commit
  def fetch_latest_projects(limit: 6)
    personal_repos = fetch_repos_for_account(PERSONAL_ACCOUNT)
    org_repos = fetch_repos_for_account(ORG_ACCOUNT)

    all_repos = (personal_repos + org_repos)
      .sort_by { |repo| repo[:pushed_at] }
      .reverse
      .take(limit)

    all_repos
  end

  # Fetch all repositories for tech stack parsing
  def fetch_all_repos
    personal_repos = fetch_repos_for_account(PERSONAL_ACCOUNT)
    org_repos = fetch_repos_for_account(ORG_ACCOUNT)
    personal_repos + org_repos
  end

  private

  def fetch_repos_for_account(account)
    uri = URI("#{API_BASE_URL}/users/#{account}/repos?per_page=100&sort=pushed")

    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      # Skip SSL verification for development (fix certificate issues)
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE if Rails.env.development?

      request = Net::HTTP::Get.new(uri)
      @http_options.each { |key, value| request[key] = value }

      response = http.request(request)

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
        account: account
      }
    end
  end
end
