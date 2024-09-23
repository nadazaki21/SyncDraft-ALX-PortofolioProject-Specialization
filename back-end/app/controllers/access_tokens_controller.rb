class AccessTokensController < ApplicationController

    # on logging in or signing up  we'll call this function to create a token 
    def create
        @user = User.find_by(email: params[:email])

        if @user&.authenticate(params[:password]) # Authenticate using has_secure_password
            token = generate_jwt(@user)
            render json: { user: @user, token: token }, status: :ok
        else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
    end 

    private

    def generate_jwt(user)
        payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
        JWT.encode(payload, Rails.application.credentials.secret_key_base)
    end

end