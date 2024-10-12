Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  # Health status check
  get "up" => "rails/health#show", as: :rails_health_check

  # Users and access tokens
  resources :users, only: [:show, :create, :destroy]
  resources :access_tokens, only: [:create, :destroy, :update, :show]

  # Requests routes
  resources :requests, only: [:create, :destroy]
  get 'requests', to: 'requests#show'

  # Permissions routes
  resources :permissions, only: [:create, :destroy, :show, :update]

  # Action Cable for WebSocket connection
  mount ActionCable.server => '/cable'

  # Documents API routes
  namespace :api do
    resources :documents, only: [:index, :show, :create, :update, :destroy] do
      collection do
        get 'recent'  # Fetch recent documents opened by the user
      end
    
      # Nested routes for document versions
      resources :versions, controller: 'document_versions', only: [:index, :show, :create, :update, :destroy] do
        member do
          post :restore  # Restore a specific version
        end
        collection do
          get :compare  # Compare two versions
        end
      end
    end
    
    # Route to fetch user activity related to documents
    get 'user/activity', to: 'documents#user_activity'

  end
end
