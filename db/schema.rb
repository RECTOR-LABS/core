# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_12_24_002859) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "github_repos", force: :cascade do |t|
    t.string "account", null: false
    t.integer "commit_count"
    t.datetime "created_at", null: false
    t.datetime "created_at_github"
    t.text "description"
    t.integer "forks_count"
    t.string "full_name", null: false
    t.string "html_url", null: false
    t.boolean "is_fork"
    t.string "language"
    t.string "latest_commit_sha"
    t.string "name", null: false
    t.datetime "pushed_at", null: false
    t.integer "stargazers_count"
    t.text "topics"
    t.datetime "updated_at", null: false
    t.datetime "updated_at_github"
    t.index ["account"], name: "index_github_repos_on_account"
    t.index ["full_name"], name: "index_github_repos_on_full_name", unique: true
    t.index ["pushed_at"], name: "index_github_repos_on_pushed_at"
  end

  create_table "works", force: :cascade do |t|
    t.string "category"
    t.datetime "created_at", null: false
    t.boolean "featured"
    t.integer "github_forks"
    t.integer "github_stars"
    t.string "github_url"
    t.date "launched_at"
    t.string "live_url"
    t.string "repo_name"
    t.string "slug"
    t.date "started_at"
    t.string "status"
    t.text "story"
    t.text "summary"
    t.json "technologies"
    t.string "title"
    t.datetime "updated_at", null: false
  end
end
