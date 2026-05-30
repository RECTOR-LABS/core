require "test_helper"

class JournalControllerTest < ActionDispatch::IntegrationTest
  setup do
    Post.content_dir = Rails.root.join("test", "fixtures", "files", "journal")
    Post.reload!
  end

  teardown do
    Post.content_dir = nil
    Post.reload!
  end

  test "index renders successfully" do
    get journal_url
    assert_response :success
    assert_select "h1", /Journal/
  end

  test "show renders a published post" do
    get journal_post_url("sample-post")
    assert_response :success
    assert_select "h1", /Sample Post/
  end

  test "show returns 404 for a draft post" do
    get journal_post_url("hidden-draft")
    assert_response :not_found
  end

  test "show returns 404 for an unknown slug" do
    get journal_post_url("does-not-exist")
    assert_response :not_found
  end
end
