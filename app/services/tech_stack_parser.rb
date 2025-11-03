# frozen_string_literal: true

class TechStackParser
  # Language categorization based on usage patterns
  CATEGORIES = {
    blockchain: ["Rust", "Solidity", "Move"],
    web: ["JavaScript", "TypeScript", "HTML", "CSS", "SCSS"],
    backend: ["Ruby", "Python", "Go", "Java", "Kotlin", "PHP"],
    mobile: ["Swift", "Kotlin", "Dart"],
    infra: ["Shell", "Dockerfile", "HCL"],
    data: ["Python", "R", "Julia"],
    systems: ["C", "C++", "Rust", "Go"]
  }.freeze

  def initialize(repos = nil)
    @repos = repos || GithubRepo.not_forks.all
  end

  # Parse tech stack from all repos
  # Returns hash with categorized languages and counts
  def parse
    language_counts = count_languages
    categorized = categorize_languages(language_counts)

    {
      all_languages: language_counts,
      categorized: categorized,
      primary: determine_primary_languages(language_counts, limit: 5),
      total_repos: @repos.count
    }
  end

  private

  def count_languages
    # Use database aggregation for better performance with large datasets
    GithubRepo.not_forks
      .where.not(language: nil)
      .group(:language)
      .count
      .sort_by { |_lang, count| -count }
      .to_h
  end

  def categorize_languages(language_counts)
    categorized = {}

    CATEGORIES.each do |category, languages|
      category_langs = language_counts.select { |lang, _count| languages.include?(lang) }
      categorized[category] = category_langs unless category_langs.empty?
    end

    # Add "other" category for uncategorized languages
    categorized_langs = CATEGORIES.values.flatten
    other_langs = language_counts.reject { |lang, _count| categorized_langs.include?(lang) }
    categorized[:other] = other_langs unless other_langs.empty?

    categorized
  end

  def determine_primary_languages(language_counts, limit: 5)
    language_counts.first(limit).map do |lang, count|
      {
        name: lang,
        count: count,
        percentage: calculate_percentage(count, @repos.count)
      }
    end
  end

  def calculate_percentage(count, total)
    return 0 if total.zero?

    ((count.to_f / total) * 100).round(1)
  end

  # Class method for quick access
  def self.current_stack
    new.parse
  end

  # Get a human-readable summary
  def summary
    stack = parse
    primary_langs = stack[:primary].map { |l| l[:name] }.join(", ")

    "Working with #{stack[:total_repos]} projects. Primary: #{primary_langs}"
  end
end
