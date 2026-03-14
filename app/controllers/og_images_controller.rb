# frozen_string_literal: true

class OgImagesController < ApplicationController
  def show
    path = OgImageGenerator.cached_path
    expires_in 1.hour, public: true
    send_file path, type: "image/png", disposition: "inline"
  end
end
