# frozen_string_literal: true

require "net/http"
require "json"

class GithubContributionsService
  API_URL = "https://github-contributions-api.jogruber.de/v4"
  USERNAME = "rz1989s"

  def initialize(username = USERNAME)
    @username = username
  end

  # Fetch contribution data for the last year
  def fetch_contributions
    uri = URI("#{API_URL}/#{@username}?y=last")

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
        parse_response(JSON.parse(response.body, symbolize_names: true))
      else
        Rails.logger.error "GitHub Contributions API error: #{response.code}"
        fallback_data
      end
    rescue StandardError => e
      Rails.logger.error "GitHub Contributions fetch failed: #{e.message}"
      fallback_data
    end
  end

  private

  def parse_response(data)
    # Get contributions from API response
    contributions = data[:contributions] || []

    # Sort by date (API returns sorted, but ensure)
    sorted_contributions = contributions.sort_by { |c| c[:date] }

    # Get total from API response (format: {lastYear: N})
    total_last_year = data.dig(:total, :lastYear) || sorted_contributions.sum { |c| c[:count] }

    # Organize into weeks (for grid layout)
    weeks = organize_into_weeks(sorted_contributions)

    {
      total: total_last_year,
      yearly_totals: data[:total] || {},
      weeks: weeks,
      contributions: sorted_contributions
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
      contributions: []
    }
  end
end
