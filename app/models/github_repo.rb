class GithubRepo < ApplicationRecord
  # Validations
  validates :name, presence: true
  validates :full_name, presence: true, uniqueness: true
  validates :account, presence: true

  # Scopes
  scope :latest_first, -> { order(pushed_at: :desc) }
  scope :personal, -> { where(account: "rz1989s") }
  scope :organization, -> { where(account: "RECTOR-LABS") }
  scope :not_forks, -> { where(is_fork: false) }

  # Serialize topics array as JSON
  serialize :topics, coder: JSON

  # Class method to sync from GitHub API
  def self.sync_from_github
    service = GithubApiService.new
    repos = service.fetch_all_repos

    repos.each do |repo_data|
      repo = find_or_initialize_by(full_name: repo_data[:full_name])
      repo.update(
        name: repo_data[:name],
        description: repo_data[:description],
        html_url: repo_data[:html_url],
        language: repo_data[:language],
        stargazers_count: repo_data[:stargazers_count],
        forks_count: repo_data[:forks_count],
        pushed_at: repo_data[:pushed_at],
        created_at_github: repo_data[:created_at],
        updated_at_github: repo_data[:updated_at],
        topics: repo_data[:topics],
        is_fork: repo_data[:is_fork],
        account: repo_data[:account]
      )
    end

    Rails.logger.info "Synced #{repos.count} repositories from GitHub"
  end

  # Instance method to format updated time
  def time_ago
    time_diff = Time.current - pushed_at
    days = (time_diff / 1.day).to_i

    if days.zero?
      "today"
    elsif days == 1
      "yesterday"
    elsif days < 30
      "#{days} days ago"
    elsif days < 365
      "#{(days / 30).to_i} months ago"
    else
      "#{(days / 365).to_i} years ago"
    end
  end
end
