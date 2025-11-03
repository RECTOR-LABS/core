class SyncGithubReposJob < ApplicationJob
  queue_as :default

  # Retry with exponential backoff if GitHub API fails
  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform
    Rails.logger.info "Starting GitHub repositories sync..."

    # Sync all repos from GitHub API to database
    GithubRepo.sync_from_github

    Rails.logger.info "GitHub repositories sync completed successfully"
  rescue StandardError => e
    Rails.logger.error "GitHub sync failed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise # Re-raise to trigger retry logic
  end
end
