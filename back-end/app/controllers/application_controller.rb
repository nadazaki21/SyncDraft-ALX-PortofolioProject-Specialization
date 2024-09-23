class ApplicationController < ActionController::API

    # function to et the current user, if the user has a session, he is set to be the current user
    def current_user
        if session[:user_id]
            @current_user ||= User.find_by(id: session[:user_id])
        # else it would mean that the user is already set 
    end
    
    # Method to ensure a user is logged in
    def authenticate_user!
        render json: { error: "No User Loggged In" }, status: :unauthorized unless current_user
    end

end
