class AddCommitInfoToGithubRepos < ActiveRecord::Migration[8.1]
  def change
    add_column :github_repos, :commit_count, :integer
    add_column :github_repos, :latest_commit_sha, :string
  end
end
