class PagesController < ApplicationController
  def home
    # Fetch latest projects from cache (database)
    @latest_projects = GithubRepo.not_forks.latest_first.limit(6)

    # Parse tech stack from all repos
    @tech_stack = TechStackParser.current_stack

    # If cache is empty, trigger sync job and show placeholder
    if @latest_projects.empty?
      SyncGithubReposJob.perform_later
      @syncing = true
    end
  end
end
