class UsersController < ApplicationController
    before_action :set_user, only: [:show, :destroy]
  
    # GET /users/:id
    def show
      render json: @user
    end
  
    # POST /users
    def create
        modified_params = user_params
        modified_params[:username] = user_params[:email].split('@')[0]
        
        @user = User.new(modified_params)
        
        if @user.save
            render json: @user, status: :created
        else
            render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
    end
  
    # DELETE /users/:id
    def destroy
      @user.destroy
      head :no_content
    end
  
    private
  
    # Set user for show and destroy
    def set_user
      @user = User.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'User not found' }, status: :not_found
    end
  
    # Strong params for user creation
    def user_params
      params.require(:user).permit(:name, :email, :password)
      # these will be sent as json to the post reuest but rails parses them into a hash 
    end
end
  