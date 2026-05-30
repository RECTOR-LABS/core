class JournalController < ApplicationController
  def index
    @posts = Post.recent
  end

  def show
    @post = Post.find(params[:slug])
    render_not_found if @post.nil? || @post.draft?
  end

  private

  def render_not_found
    render file: Rails.public_path.join("404.html"), status: :not_found, layout: false
  end
end
