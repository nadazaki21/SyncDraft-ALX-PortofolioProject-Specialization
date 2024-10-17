class Api::DocumentsController < ApplicationController
  before_action :authenticate_request
  before_action :set_document, only: [:show, :update, :destroy]

  # GET /api/documents
  def index
    # Fetch documents where the current user is either the creator or has permissions
    @documents = Document.where("created_by_id = ? OR id IN (?)", current_user.id, permissioned_document_ids)
    render json: @documents
  end

  # GET /api/documents/recent
  def recent
      # Fetch recent documents opened by the current user
      @recent_documents = Document.where("created_by_id = ? OR id IN (?)", current_user.id, permissioned_document_ids).order(updated_at: :desc).limit(5)
      render json: @recent_documents, only: [:id, :title, :updated_at]
  end

  # GET /api/user/activity
  def user_activity
    # Count documents created by the current user
    created_count = Document.where(created_by_id: current_user.id).count
  
    # Count documents shared with the current user (where they have permission)
    shared_count = Document.joins(:permissions)
                           .where(permissions: { user_id: current_user.id })
                           .count
  
    render json: { documents_created: created_count, documents_shared: shared_count }
  end

  # POST /api/documents
  def create
    @document = Document.new(document_params)
    @document.created_by_id = current_user.id # Set the creator to the current user

    if @document.save
      render json: @document, status: :created
    else
      render json: @document.errors, status: :unprocessable_entity
    end
  end

  # GET /api/documents/:id
  def show
    redis_key_content = "document_#{@document.id}_content"
    redis_key_title = "document_#{@document.id}_title"

  
    # Check if content and title exist in Redis
    content = Redis.current.get(redis_key_content)
    puts ("Redis key #{redis_key_title} set with value: #{Redis.current.get(redis_key_content)}")

    if content
      # If found in Redis, return the content from Redis
      render json: { id: @document.id, content: content, source: 'redis', title: @document.title }
    else
      # If not found in Redis, fetch from PostgreSQL as usual
      render json: { id: @document.id, content: @document.content, source: 'postgresql', title: @document.title }
    end
  end

  # PUT /api/documents/:id
  def update
    # Check if the current user is the creator of the document or has the editor role
    if current_user.id == @document.created_by_id || @document.permissions.exists?(user_id: current_user.id, access_type: :editor)
      if @document.update(document_params)
        # Clear the document's content from Redis after it is successfully updated in PostgreSQL
        redis_key_content = "document_#{@document.id}_content"
        Redis.current.del(redis_key_content)

        render json: @document, status: :ok
      else
        render json: @document.errors, status: :unprocessable_entity
      end
    else
      render json: { error: 'You are not authorized to update this document' }, status: :forbidden
    end
  end

  # DELETE /api/documents/:id
  def destroy
    if current_user.id == @document.created_by_id
      @document.destroy
      head :no_content
    else
      render json: { error: 'You are not authorized to delete this document' }, status: :forbidden
    end
  end

  private

  def set_document
    @document = Document.find(params[:id])
  end

  def document_params
    params.require(:document).permit(:title, :content, :created_by_id)
  end

  def permissioned_document_ids
    # Get the IDs of documents for which the user has access permissions
    # You can filter by access type if needed, e.g., for editors only:
    Permission.where(user: current_user.id, access_type: [:viewer, :editor]).pluck(:document_id)
  end
end
