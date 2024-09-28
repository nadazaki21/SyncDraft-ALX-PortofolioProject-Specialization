class UsersController < ApplicationController
    before_action :set_user, only: [:show, :destroy]
  
    # GET /users/:id
    def show
      user = User.find(params[:id])
      if user
        render json: user, status: :ok
      else 
        render json: {error: 'User not Found'} , status: :not_found
      end
    end
  
    # POST /users
    def create

        @user = User.new(user_params)
        
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
      parameters = params.require(:user).permit(:name, :email, :password)
      puts ( " in user params function the params are")
      puts (parameters)
      return parameters
      # these will be sent as json to the post reuest but rails parses them into a hash 
    end
end
  