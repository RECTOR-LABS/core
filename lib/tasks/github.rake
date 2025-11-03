# frozen_string_literal: true

namespace :github do
  desc "Sync repositories from GitHub API to database"
  task sync: :environment do
    puts "Syncing GitHub repositories..."
    SyncGithubReposJob.perform_now
    puts "Done! Synced #{GithubRepo.count} repositories."
  end

  desc "Show tech stack summary"
  task tech_stack: :environment do
    parser = TechStackParser.new
    stack = parser.parse

    puts "\n=== Tech Stack Summary ==="
    puts "Total repos: #{stack[:total_repos]}"
    puts "\nPrimary languages:"
    stack[:primary].each do |lang|
      puts "  #{lang[:name]}: #{lang[:count]} repos (#{lang[:percentage]}%)"
    end

    puts "\nCategorized:"
    stack[:categorized].each do |category, langs|
      puts "  #{category.to_s.capitalize}: #{langs.keys.join(', ')}"
    end
  end
end
