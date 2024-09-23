class SessionController < ApplicationController

    # on signing up or logging in, the user would already be created
    def create
        @current_user = User.find_by(email: params[:email])

        if @user && @user.authenticate(params[:password])
            # Storing the user's ID in the session
            session[:user_id] = @user.id
            render json: { message: "Logged in successfully" }, status: :ok
        else
            render json: { error: "Invalid email or password" }, status: :unprocessable_entity
        end
    end
      
    def destroy
        # Clearing the session (logging out)
        session[:user_id] = nil
        render json: { message: "Logged out successfully" }, status: :ok
    end


    private
    # not used yet 
    def generate_jwt(user)
        payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
        JWT.encode(payload, Rails.application.credentials.secret_key_base)
    end
end
