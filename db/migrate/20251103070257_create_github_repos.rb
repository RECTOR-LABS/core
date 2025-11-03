class CreateGithubRepos < ActiveRecord::Migration[8.1]
  def change
    create_table :github_repos do |t|
      t.string :name
      t.string :full_name
      t.text :description
      t.string :html_url
      t.string :language
      t.integer :stargazers_count
      t.integer :forks_count
      t.datetime :pushed_at
      t.datetime :created_at_github
      t.datetime :updated_at_github
      t.text :topics
      t.boolean :is_fork
      t.string :account

      t.timestamps
    end

    add_index :github_repos, :full_name, unique: true
    add_index :github_repos, :pushed_at
    add_index :github_repos, :account
  end
end
