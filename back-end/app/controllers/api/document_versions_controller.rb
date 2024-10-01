class Api::DocumentVersionsController < ApplicationController
  before_action :authenticate_request
  before_action :set_document_version, only: [:show, :update, :destroy]

  # GET api/documents/:document_id/versions
  def index
    # Filter versions by the specific document
    @document_versions = DocumentVersion.where(document_id: params[:document_id])
    render json: @document_versions
  end

  # GET /document_versions/:id
  def show
    render json: @document_version
  end

  # POST /document_versions
  def create
    @document_version = DocumentVersion.new(document_version_params)
    @document_version.created_by_id = current_user.id # Set the creator to the current user

    if @document_version.save
      render json: @document_version, status: :created
    else
      render json: @document_version.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /document_versions/:id
  def update
    if @document_version.update(document_version_params)
      render json: @document_version
    else
      render json: @document_version.errors, status: :unprocessable_entity
    end
  end

  # DELETE /document_versions/:id
  def destroy
    @document_version.destroy
    head :no_content
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_document_version
    @document_version = DocumentVersion.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def document_version_params
    params.require(:document_version).permit(:document_id, :content, :version_number, :change_description)
  end
end
