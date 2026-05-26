# frozen_string_literal: true

# Regenerate public/og-image.png on app boot so social previews always
# reflect the latest achievements.yml. Wrapped in rescue so a missing
# ImageMagick install (e.g. on a fresh dev machine) doesn't crash boot.
Rails.application.config.after_initialize do
  OgImageGenerator.cached_path
rescue => e
  Rails.logger.warn "OG image warmup failed: #{e.class}: #{e.message}"
end
