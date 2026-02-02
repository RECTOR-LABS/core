# frozen_string_literal: true

# Achievement PORO (Plain Old Ruby Object)
# Loads achievements from YAML file - no database required
# Single source of truth: config/achievements.yml
class Achievement
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :slug, :string
  attribute :title, :string
  attribute :type, :string
  attribute :place, :string
  attribute :prize_amount, :integer
  attribute :prize_extras, :string
  attribute :event, :string
  attribute :event_detail, :string
  attribute :date, :string
  attribute :github_url, :string
  attribute :repo_name, :string
  attribute :description, :string

  class << self
    # Load all achievements from YAML
    def all
      @all ||= load_from_yaml
    end

    # Sum of all prize amounts
    def total_earnings
      all.sum(&:prize_amount)
    end

    # Total number of achievements
    def win_count
      all.size
    end

    # Hash of repo_name => emoji for project badges
    def winner_projects
      all.each_with_object({}) do |achievement, hash|
        # Skip if repo already has a badge (first occurrence wins)
        next if hash.key?(achievement.repo_name)

        hash[achievement.repo_name] = achievement.badge_emoji
      end
    end

    # Year range string (e.g., "2024-2026")
    def year_range
      years = all.map { |a| a.date.to_s.split("-").first.to_i }.uniq.sort
      return years.first.to_s if years.size == 1

      "#{years.first}-#{years.last}"
    end

    # Clear cache (useful for development)
    def reload!
      @all = nil
    end

    private

    def load_from_yaml
      yaml_path = Rails.root.join("config", "achievements.yml")
      data = YAML.load_file(yaml_path, permitted_classes: [ Date ])
      data.map { |attrs| new(attrs) }
    end
  end

  # Badge emoji based on place
  def badge_emoji
    case place.to_s.downcase
    when "1st" then "🥇"
    when "2nd" then "🥈"
    when "3rd" then "🥉"
    when "winner" then "🏆"
    when "approved" then "✅"
    else "🎖️"
    end
  end

  # Badge label for display
  def badge_label
    case place.to_s.downcase
    when "approved" then "Grant Approved"
    when "winner" then "Winner"
    else "#{place} Place"
    end
  end

  # CSS class for badge styling
  def badge_class
    case type.to_s.downcase
    when "grant" then "achievement-gold"
    when "bounty" then "achievement-bounty"
    else
      # Hackathon badges based on place
      case place.to_s.downcase
      when "1st", "winner" then "achievement-gold"
      when "2nd" then "achievement-silver"
      else "achievement-bounty"
      end
    end
  end

  # Formatted prize string
  def formatted_prize
    base = "$#{ActiveSupport::NumberHelper.number_to_delimited(prize_amount)}"
    prize_extras.present? ? "#{base} + #{prize_extras}" : base
  end

  # Full event string with detail
  def full_event
    event_detail.present? ? "#{event} • #{event_detail}" : event
  end
end
