class ApplicationController < ActionController::API
    before_action :authenticate_request, except: [:create]
    
    attr_reader :current_user
    def authenticate_request
        token = request.headers['Authorization']&.split(' ')&.last
        # Rails.logger.debug("JWT Token: #{token}") # Log the token to check if it's being received
    
        decoded_token = decode_jwt(token)
    
        if decoded_token
            # Rails.logger.debug("Decoded JWT: #{decoded_token.inspect}") # Log the decoded token
    
            @current_user = User.find_by(id: decoded_token["user_id"])
            # Rails.logger.debug("Current User: #{@current_user.inspect}") # Log the current user
    
            if @current_user.nil?
                render json: { error: 'User not found' }, status: :unauthorized
            end
        else
            render json: { error: 'Invalid token' }, status: :unauthorized
        end
    end
    
    private
    
    def decode_jwt(token)
        return unless token
    
        begin
        JWT.decode(token, Rails.application.credentials.secret_key_base).first
        rescue JWT::DecodeError
        nil
        end
    end
 

      

    # # function to et the current user, if the user has a session, he is set to be the current user
    # def current_user
    #     if session[:user_id]
    #         @current_user ||= User.find_by(id: session[:user_id])
    #     # else it would mean that the user is already set 
    # end
    
    # # Method to ensure a user is logged in
    # def authenticate_user!
    #     render json: { error: "No User Loggged In" }, status: :unauthorized unless current_user
    # end

end
