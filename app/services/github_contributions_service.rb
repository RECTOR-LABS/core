# frozen_string_literal: true

require "net/http"
require "json"

class GithubContributionsService
  API_URL = "https://github-contributions-api.jogruber.de/v4"
  USERNAME = "rz1989s"

  def initialize(username = USERNAME)
    @username = username
  end

  # Fetch contribution data for a specific year or last year
  # year: integer (e.g., 2025) or "last" for rolling 12 months
  def fetch_contributions(year: "last")
    uri = URI("#{API_URL}/#{@username}?y=#{year}")

    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER
      http.open_timeout = 5
      http.read_timeout = 10

      request = Net::HTTP::Get.new(uri)
      request["Accept"] = "application/json"
      request["User-Agent"] = "RECTOR-LABS-CORE"

      response = http.request(request)

      if response.code == "200"
        parse_response(JSON.parse(response.body, symbolize_names: true), year)
      else
        Rails.logger.error "GitHub Contributions API error: #{response.code}"
        fallback_data
      end
    rescue StandardError => e
      Rails.logger.error "GitHub Contributions fetch failed: #{e.message}"
      fallback_data
    end
  end

  # Fetch available years from API (returns hash of year => total)
  def fetch_available_years
    # Fetch "all" years to get the totals
    uri = URI("#{API_URL}/#{@username}")

    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER
      http.open_timeout = 5
      http.read_timeout = 10

      request = Net::HTTP::Get.new(uri)
      request["Accept"] = "application/json"
      request["User-Agent"] = "RECTOR-LABS-CORE"

      response = http.request(request)

      if response.code == "200"
        data = JSON.parse(response.body, symbolize_names: true)
        totals = data[:total] || {}
        # Convert to array of years with contributions, sorted descending
        totals.except(:lastYear).map { |year, count| { year: year.to_s.to_i, count: count } }
              .select { |y| y[:year] > 2000 && y[:count] > 0 }
              .sort_by { |y| -y[:year] }
      else
        []
      end
    rescue StandardError => e
      Rails.logger.error "GitHub fetch years failed: #{e.message}"
      []
    end
  end

  private

  def parse_response(data, year)
    # Get contributions from API response
    contributions = data[:contributions] || []

    # Sort by date (API returns sorted, but ensure)
    sorted_contributions = contributions.sort_by { |c| c[:date] }

    # Get total - use year-specific if available, otherwise calculate
    total = if year == "last"
      data.dig(:total, :lastYear) || sorted_contributions.sum { |c| c[:count] }
    else
      data.dig(:total, year.to_s.to_sym) || sorted_contributions.sum { |c| c[:count] }
    end

    # Organize into weeks (for grid layout)
    weeks = organize_into_weeks(sorted_contributions)

    # Calculate streaks
    streaks = calculate_streaks(sorted_contributions)

    {
      total: total,
      selected_year: year,
      yearly_totals: data[:total] || {},
      weeks: weeks,
      contributions: sorted_contributions,
      current_streak: streaks[:current],
      longest_streak: streaks[:longest]
    }
  end

  def organize_into_weeks(contributions)
    return [] if contributions.empty?

    weeks = []
    current_week = []

    contributions.each do |day|
      date = Date.parse(day[:date])

      # Start new week on Sunday (wday == 0)
      if date.wday == 0 && current_week.any?
        weeks << current_week
        current_week = []
      end

      current_week << day
    end

    # Add last incomplete week
    weeks << current_week if current_week.any?

    weeks
  end

  def fallback_data
    {
      total: 0,
      yearly_totals: {},
      weeks: [],
      contributions: [],
      current_streak: 0,
      longest_streak: 0
    }
  end

  # Calculate current and longest contribution streaks
  def calculate_streaks(contributions)
    return { current: 0, longest: 0 } if contributions.empty?

    # Sort by date descending (most recent first) for current streak
    sorted_desc = contributions.sort_by { |c| c[:date] }.reverse

    current_streak = 0
    longest_streak = 0
    temp_streak = 0

    # Calculate current streak (from today backwards)
    today = Date.today
    sorted_desc.each do |day|
      date = Date.parse(day[:date])
      # Allow for today or yesterday to start the streak (in case no commits yet today)
      break if (today - date).to_i > current_streak + 1

      if day[:count] > 0
        current_streak += 1
      else
        break
      end
    end

    # Calculate longest streak (iterate through all days)
    contributions.sort_by { |c| c[:date] }.each do |day|
      if day[:count] > 0
        temp_streak += 1
        longest_streak = [ temp_streak, longest_streak ].max
      else
        temp_streak = 0
      end
    end

    { current: current_streak, longest: longest_streak }
  end
end
