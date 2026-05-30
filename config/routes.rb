Rails.application.routes.draw do
  # RECTOR LABS - Homepage
  root "pages#home"

  # Contribution graph (Turbo Frame endpoint)
  get "contributions", to: "pages#contributions"

  # Work section - story-driven project showcase
  resources :works, path: "work", only: [ :index, :show ]

  # Journal section - file-based blog
  get "journal", to: "journal#index", as: :journal
  get "journal/:slug", to: "journal#show", as: :journal_post

  # Apply section - targeted CVs for specific companies
  get "apply/arbital",        to: "apply#arbital",        as: :apply_arbital
  get "apply/arbital/retro",  to: "apply#arbital_retro",  as: :apply_arbital_retro
  get "apply/arbital/modern", to: "apply#arbital_modern", as: :apply_arbital_modern
  get "apply/superteam",      to: "apply#superteam",      as: :apply_superteam

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # PWA files (optional)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
