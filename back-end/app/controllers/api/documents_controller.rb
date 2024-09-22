class Api::DocumentsController < ApplicationController
  before_action :set_document, only: [:show, :update, :destroy]

  # GET /api/documents
  def index
    @documents = Document.all
    render json: @documents
  end

  # GET /api/documents/recent
  def recent
      # Fetch recent documents opened by the current user
      @recent_documents = Document.where(user_id: current_user.id).order(updated_at: :desc).limit(5)
      render json: @recent_documents, only: [:id, :title, :updated_at]
  end

    # GET /api/user/activity
    def user_activity
      # Count documents created by the current user
      created_count = Document.where(created_by_id: current_user.id).count
  
      # Count documents shared with the current user
      shared_count = Document.joins(:shared_users).where(shared_users: { user_id: current_user.id }).count
  
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
end
