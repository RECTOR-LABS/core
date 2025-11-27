Rails.application.routes.draw do
  # RECTOR LABS - Homepage
  root "pages#home"

  # Work section - story-driven project showcase
  resources :works, path: "work", only: [ :index, :show ]

  # Apply section - targeted CVs for specific companies
  get "apply/arbital",        to: "apply#arbital",        as: :apply_arbital
  get "apply/arbital/retro",  to: "apply#arbital_retro",  as: :apply_arbital_retro
  get "apply/arbital/modern", to: "apply#arbital_modern", as: :apply_arbital_modern

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # PWA files (optional)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
