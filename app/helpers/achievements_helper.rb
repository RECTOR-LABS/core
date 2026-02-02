# frozen_string_literal: true

module AchievementsHelper
  # Summary string for meta tags and descriptions
  # Returns: "6 wins, ~$24,300 earned"
  def achievements_summary
    "#{Achievement.win_count} wins, ~$#{number_with_delimiter(Achievement.total_earnings)} earned"
  end

  # Total earnings with formatting
  # Returns: "$24,300"
  def total_earnings_formatted
    "$#{number_with_delimiter(Achievement.total_earnings)}"
  end
end
