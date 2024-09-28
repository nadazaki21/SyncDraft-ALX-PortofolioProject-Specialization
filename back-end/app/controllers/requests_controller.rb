class RequestsController < ApplicationController
    

    def show
        requests = Request.where(user_id: current_user.id)
        if requests
            render json: requests , status: :ok
        else
            render json: { error: 'User not found' } , status: :not_found
        end
    end

    def create
        user = User.find_by(email: request_params[:user])
        document = Document.find_by(id: request_params[:document])
      
        if user
          request = Request.new(permission: request_params[:permission], user_id: user.id, document_id: document.id)
      
          #puts (request.inspect)
          if request.save
            render json: request, status: :created
          else
            render json: request.errors, status: :unprocessable_entity
          end
        else
          render json: { error: 'User not found' }, status: :unprocessable_entity
        end
      end

      def destroy
        request = Request.find(params[:id])
      
        if request
          request.destroy
          render status: :no_content
        else
          render json: { error: 'Request to delete is not found' }, status: :not_found
        end
      end
  
    private
  
    def request_params
      params.require(:request).permit(:permission, :document, :user)
    end
end
  