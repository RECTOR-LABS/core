class PagesController < ApplicationController
  def home
    # Fetch latest projects from cache (database)
    @latest_projects = GithubRepo.not_forks.latest_first.limit(6)

    # Parse tech stack from all repos
    @tech_stack = TechStackParser.current_stack

    # Get selected year (default to current year)
    @selected_year = params[:year].presence || Date.current.year.to_s

    # Fetch available years for tabs
    service = GithubContributionsService.new
    @available_years = service.fetch_available_years

    # Fetch GitHub contributions for selected year
    @contributions = service.fetch_contributions(year: @selected_year)

    # Aggregate stats across all repos
    @aggregate_stats = GithubRepo.aggregate_stats

    # Currently building (most recently pushed repo)
    @currently_building = GithubRepo.currently_building

    # If cache is empty, trigger sync job and show placeholder
    if @latest_projects.empty?
      SyncGithubReposJob.perform_later
      @syncing = true
    end
  end

  # Turbo Frame endpoint for contribution graph
  def contributions
    @selected_year = params[:year].presence || Date.current.year.to_s
    service = GithubContributionsService.new
    @available_years = service.fetch_available_years
    @contributions = service.fetch_contributions(year: @selected_year)

    render partial: "pages/contribution_graph", locals: {
      contributions: @contributions,
      selected_year: @selected_year,
      available_years: @available_years
    }
  end
end
