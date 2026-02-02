module ApplicationHelper
  # Format a list of repos as "repo1, repo2 and repo3" with links
  def recently_shipping_list(repos)
    links = repos.map do |repo|
      content_tag(:strong) { link_to(repo.name, repo.html_url, target: "_blank", rel: "noopener") }
    end

    if links.size == 1
      links.first
    elsif links.size == 2
      safe_join(links, " and ")
    else
      safe_join([safe_join(links[0...-1], ", "), links.last], " and ")
    end
  end
end
