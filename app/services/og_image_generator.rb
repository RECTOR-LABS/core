# frozen_string_literal: true

require "mini_magick"

# Generates dynamic Open Graph images with live achievement stats.
# Cached in tmp/cache/og/ — regenerates when achievements.yml changes.
class OgImageGenerator
  WIDTH = 1200
  HEIGHT = 630
  BG_COLOR = "#2D2320"

  def self.cached_path
    new.cached_path
  end

  def cached_path
    generate! unless valid_cache?
    cache_file
  end

  private

  def cache_file
    Rails.root.join("tmp", "cache", "og", "og-image.png")
  end

  def valid_cache?
    cache_file.exist? && cache_file.mtime > achievements_mtime
  end

  def achievements_mtime
    Rails.root.join("config", "achievements.yml").mtime
  end

  def generate!
    FileUtils.mkdir_p(cache_file.dirname)

    # Build canvas with text layers
    MiniMagick.convert do |c|
      c.size "#{WIDTH}x#{HEIGHT}"
      c.xc BG_COLOR

      # Accent line (orange)
      c.fill "#E58C2E"
      c.draw "rectangle 80,225 130,229"

      # "RECTOR" label
      c.fill "white"
      c.font font_path(:bold)
      c.pointsize 22
      c.gravity "NorthWest"
      c.annotate "+120+68", "RECTOR"

      # "Building for Eternity" heading
      c.pointsize 48
      c.annotate "+80+260", "Building for Eternity"

      # Dynamic stats line
      c.fill "#B0A090"
      c.font font_path(:regular)
      c.pointsize 22
      c.annotate "+80+345", stats_text

      # URL bottom-right
      c.pointsize 16
      c.gravity "SouthEast"
      c.annotate "+50+40", "rectorspace.com"

      c << cache_file.to_s
    end

    # Composite profile picture
    composite_profile!
  end

  def composite_profile!
    profile = MiniMagick::Image.open(profile_path.to_s)
    profile.resize "60x60"

    canvas = MiniMagick::Image.open(cache_file.to_s)
    result = canvas.composite(profile) do |comp|
      comp.compose "Over"
      comp.geometry "+50+55"
    end
    result.write(cache_file.to_s)
  end

  def stats_text
    count = Achievement.win_count
    earnings = ActiveSupport::NumberHelper.number_to_delimited(Achievement.total_earnings)
    "Full-stack builder. Hackathon hunter. #{count} wins, ~$#{earnings} earned."
  end

  def profile_path
    Rails.root.join("app", "assets", "images", "rector_profile_image.png")
  end

  def font_path(weight)
    name = weight == :bold ? "JetBrainsMono-Bold" : "JetBrainsMono-Regular"
    bundled = Rails.root.join("app", "assets", "fonts", "#{name}.ttf")
    return bundled.to_s if bundled.exist?

    # Fallback to system font
    weight == :bold ? "DejaVu-Sans-Mono-Bold" : "DejaVu-Sans-Mono"
  end
end
