# frozen_string_literal: true

module VersionHelper
  # Returns the current git commit SHA from REVISION file
  # Returns nil if file doesn't exist (development/test)
  def current_commit_sha
    version_info = read_version_file
    version_info[:sha]
  end

  # Returns the current git branch name
  def current_branch
    version_info = read_version_file
    version_info[:branch]
  end

  # Returns short version of commit SHA (first 7 characters)
  def short_commit_sha
    sha = current_commit_sha
    sha ? sha[0..6] : nil
  end

  # Returns GitHub URL for the current commit
  def commit_github_url
    sha = current_commit_sha
    return nil unless sha

    "https://github.com/RECTOR-LABS/core/commit/#{sha}"
  end

  # Returns GitHub URL for the current branch
  def branch_github_url
    branch = current_branch
    return nil unless branch

    "https://github.com/RECTOR-LABS/core/tree/#{branch}"
  end

  # Returns deployment timestamp from REVISION file modification time
  def deployment_timestamp
    revision_file = Rails.root.join("REVISION")
    return nil unless revision_file.exist?

    File.mtime(revision_file)
  end

  # Returns formatted deployment time (e.g., "2 hours ago")
  def deployment_time_ago
    timestamp = deployment_timestamp
    return nil unless timestamp

    time_ago_in_words(timestamp)
  end

  # Returns total number of commits in repository
  def total_commits_count
    version_info = read_version_file
    version_info[:commit_count]
  end

  private

  # Reads and parses the REVISION file
  # Format: SHA|BRANCH|COMMIT_COUNT (e.g., "abc123def456|main|57")
  def read_version_file
    return @version_info if defined?(@version_info)

    revision_file = Rails.root.join("REVISION")
    unless revision_file.exist?
      @version_info = { sha: nil, branch: nil, commit_count: nil }
      return @version_info
    end

    content = revision_file.read.strip
    parts = content.split("|")

    @version_info = {
      sha: parts[0]&.strip,
      branch: parts[1]&.strip || "unknown",
      commit_count: parts[2]&.strip&.to_i
    }
  end
end
