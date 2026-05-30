# frozen_string_literal: true

# Post PORO — loads journal posts from markdown files with YAML front matter.
# Single source of truth: content/journal/*.md  (mirrors the Achievement YAML pattern).
class Post
  include ActiveModel::Model
  include ActiveModel::Attributes

  FRONT_MATTER = /\A---\s*\r?\n(?<yaml>.*?)\r?\n---\s*\r?\n(?<body>.*)\z/m

  attribute :slug, :string
  attribute :title, :string
  attribute :summary, :string
  attribute :body, :string
  attribute :published_on, :date
  attribute :draft, :boolean, default: false
  attribute :og_image, :string
  attribute :tags, default: -> { [] }

  class << self
    attr_writer :content_dir

    def content_dir
      @content_dir || Rails.root.join("content", "journal")
    end

    def all
      if Rails.env.production?
        @all ||= load_all
      else
        load_all
      end
    end

    def published
      all.reject(&:draft?)
    end

    def recent
      published.sort_by { |p| p.published_on || Date.new(0) }.reverse
    end

    def find(slug)
      all.find { |p| p.slug == slug }
    end

    def reload!
      @all = nil
    end

    private

    def load_all
      Dir.glob(content_dir.join("*.md")).map { |path| from_file(path) }
    end

    def from_file(path)
      front, body = parse(File.read(path))
      new(
        slug: front["slug"].presence || File.basename(path, ".md"),
        title: front["title"],
        summary: front["summary"],
        body: body,
        published_on: front["date"],
        draft: front.fetch("draft", false),
        og_image: front["og_image"],
        tags: Array(front["tags"])
      )
    end

    def parse(raw)
      if (m = raw.match(FRONT_MATTER))
        [ YAML.safe_load(m[:yaml], permitted_classes: [ Date, Time ]) || {}, m[:body] ]
      else
        [ {}, raw ]
      end
    end
  end

  def to_param
    slug
  end

  def draft?
    draft
  end

  def reading_time
    # Count prose only — exclude markdown table rows (GFM rows start with "|"),
    # which are dense reference content, not reading-paced prose.
    prose = body.to_s.lines.reject { |line| line.lstrip.start_with?("|") }.join(" ")
    words = prose.split.size
    [ (words / 200.0).ceil, 1 ].max
  end
end
