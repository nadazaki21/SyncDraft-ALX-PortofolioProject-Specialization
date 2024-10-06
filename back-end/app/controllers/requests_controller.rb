class RequestsController < ApplicationController
  before_action :authenticate_request

  def show
    requests = Request.where(user_id: current_user.id)
    if requests.any?
      render json: requests, status: :ok
    else
      render json: { error: 'No requests found for the user.' }, status: :not_found
    end
  end

  def create
    # Ensure only creators can send requests
    document = Document.find_by(id: request_params[:document])
    return render json: { error: 'Document not found' }, status: :not_found unless document
    
    unless document.created_by_id == current_user.id
      return render json: { error: 'Only the creator can send requests.' }, status: :forbidden
    end

    user = User.find_by(email: request_params[:user])
    if user
      # Check if the request already exists
      existing_request = Request.find_by(document_id: document.id, user_id: user.id)
      if existing_request
        return render json: { error: 'A request has already been sent to this user for this document.' }, status: :unprocessable_entity
      end

      # Create the request with document_title
      request = Request.new(
        permission: request_params[:permission],
        user_id: user.id,
        document_id: document.id,
        document_title: document.title # Include document title here
      )

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
    request = Request.find_by(id: params[:id], user_id: current_user.id)

    if request
      request.destroy
      render json: { message: 'Request deleted successfully' }, status: :no_content
    else
      render json: { error: 'Request not found' }, status: :not_found
    end
  end

  private

  def request_params
    params.require(:request).permit(:permission, :document, :user)
  end
end
