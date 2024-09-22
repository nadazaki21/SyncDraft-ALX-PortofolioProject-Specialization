Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  
  # This line mounts the Action Cable server to the /cable endpoint.
  # This is how your front end will connect to the WebSocket.
  mount ActionCable.server => '/cable'


  # Defines the root path route ("/")
  # root "posts#index"
  
  # Documents APIs routes
  namespace :api do
    resources :documents, only: [:index, :show, :create, :update, :destroy] do
      collection do
        get 'recent'  # Fetch recent documents opened by the user
      end
    end
    get 'user/activity', to: 'documents#user_activity'
  end
end
