class AddNotNullConstraintsToGithubRepos < ActiveRecord::Migration[8.1]
  def change
    # Add NOT NULL constraints to critical fields for data integrity
    change_column_null :github_repos, :name, false
    change_column_null :github_repos, :full_name, false
    change_column_null :github_repos, :account, false
    change_column_null :github_repos, :html_url, false
    change_column_null :github_repos, :pushed_at, false
  end
end
