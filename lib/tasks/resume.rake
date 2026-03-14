# frozen_string_literal: true

namespace :resume do
  desc "Generate standalone HTML resume from resume.yml + achievements.yml"
  task generate: :environment do
    resume = YAML.load_file(
      Rails.root.join("config/resume.yml"),
      permitted_classes: [ Date ]
    ).deep_symbolize_keys

    achievements = Achievement.all
    earnings = Achievement.total_earnings
    wins = Achievement.win_count
    grants = achievements.count { |a| a.type == "grant" }
    grants_amount = achievements.select { |a| a.type == "grant" }.sum(&:prize_amount)

    stats = {
      earnings: "$#{ActiveSupport::NumberHelper.number_to_delimited(earnings)}+",
      wins: wins,
      grants_amount: "$#{ActiveSupport::NumberHelper.number_to_delimited(grants_amount)}",
      grants_count: grants
    }

    template_path = Rails.root.join("app/views/apply/_resume_pdf.html.erb")
    template = ERB.new(File.read(template_path))

    renderer = ResumeRenderer.new(resume, achievements, stats)
    html = renderer.render(template)

    output_path = File.expand_path("~/Documents/secret/rheza-sulaiman-resume.html")
    File.write(output_path, html)

    puts "Resume generated: #{output_path}"
    puts "Stats: #{wins} wins, #{stats[:earnings]} earned, #{grants} grants (#{stats[:grants_amount]})"
  end
end

class ResumeRenderer
  attr_reader :resume, :achievements, :stats

  def initialize(resume, achievements, stats)
    @resume = resume
    @achievements = achievements
    @stats = stats
  end

  def render(template)
    template.result(binding)
  end
end
