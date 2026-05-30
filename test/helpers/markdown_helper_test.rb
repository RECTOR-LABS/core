require "test_helper"

class MarkdownHelperTest < ActionView::TestCase
  test "renders markdown headings to html" do
    assert_includes markdown("# Hello"), "<h1"
  end

  test "renders tables" do
    md = "| a | b |\n|---|---|\n| 1 | 2 |"
    assert_includes markdown(md), "<table"
  end

  test "blank input returns empty string" do
    assert_equal "", markdown(nil)
  end
end
