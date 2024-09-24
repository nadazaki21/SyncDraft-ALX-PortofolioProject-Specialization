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
      @recent_documents = Document.where(user_id: user.id).order(updated_at: :desc).limit(5)
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

    if @document.save
      render json: @document, status: :created
    else
      render json: @document.errors, status: :unprocessable_entity
    end
  end

  # GET /api/documents/:id
  def show
    render json: @document
  end

  # PUT /api/documents/:id
  def update
    if @document.update(document_params)
      render json: @document
    else
      render json: @document.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/documents/:id
  def destroy
    @document.destroy
    head :no_content
  end

  private

  def set_document
    @document = Document.find(params[:id])
  end

  def document_params
    params.require(:document).permit(:title, :created_by_id, content: [:text])
  end

  def permissioned_document_ids
    # Get the IDs of documents for which the user has access permissions
    # You can filter by access type if needed, e.g., for editors only:
    Permission.where(user: current_user.id, access_type: [:viewer, :editor]).pluck(:document_id)
  end
end
