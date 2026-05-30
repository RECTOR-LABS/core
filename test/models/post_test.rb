require "test_helper"
require "tmpdir"

class PostTest < ActiveSupport::TestCase
  setup do
    Post.content_dir = Rails.root.join("test", "fixtures", "files", "journal")
    Post.reload!
  end

  teardown do
    Post.content_dir = nil
    Post.reload!
  end

  test "loads every markdown file in the content dir" do
    assert_equal 3, Post.all.size
  end

  test "parses front matter and strips it from the body" do
    post = Post.find("sample-post")
    assert_equal "Sample Post", post.title
    assert_equal "A sample summary.", post.summary
    assert_includes post.body, "Hello body"
    refute_includes post.body, "title:"
  end

  test "slug defaults to the filename without extension" do
    assert_equal "sample-post", Post.find("sample-post").slug
  end

  test "parses tags into an array" do
    assert_equal [ "alpha", "beta" ], Post.find("sample-post").tags
  end

  test "reading_time is at least one minute" do
    assert_operator Post.find("sample-post").reading_time, :>=, 1
  end

  test "published excludes drafts" do
    slugs = Post.published.map(&:slug)
    assert_includes slugs, "sample-post"
    refute_includes slugs, "hidden-draft"
  end

  test "recent sorts published posts by date descending" do
    assert_equal [ "sample-post", "older-post" ], Post.recent.map(&:slug)
  end

  test "find returns nil for an unknown slug" do
    assert_nil Post.find("does-not-exist")
  end

  test "parses front matter written with CRLF line endings" do
    Dir.mktmpdir do |dir|
      crlf = "---\r\ntitle: CRLF Post\r\ndate: 2026-05-15\r\n---\r\n\r\nCRLF body content.\r\n"
      File.binwrite(File.join(dir, "crlf-post.md"), crlf)
      Post.content_dir = Pathname.new(dir)
      Post.reload!
      post = Post.find("crlf-post")
      assert_equal "CRLF Post", post.title
      assert_includes post.body, "CRLF body content."
    end
  end

  test "reading_time counts prose only, excluding markdown tables" do
    Dir.mktmpdir do |dir|
      prose = ([ "word" ] * 200).join(" ")
      table = "\n\n| A | B |\n|---|---|\n| one | two |\n| three | four |\n"
      File.write(File.join(dir, "with-table.md"), "---\ntitle: T\ndate: 2026-05-15\n---\n\n#{prose}#{table}")
      Post.content_dir = Pathname.new(dir)
      Post.reload!
      assert_equal 1, Post.find("with-table").reading_time
    end
  end
end
