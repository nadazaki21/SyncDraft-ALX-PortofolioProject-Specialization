class DocumentVersionsController < ApplicationController
  before_action :set_document_version, only: [:show, :update, :destroy]

  # GET /document_versions
  def index
    @document_versions = DocumentVersion.all
    render json: @document_versions
  end

  # GET /document_versions/:id
  def show
    render json: @document_version
  end

  # POST /document_versions
  def create
    @document_version = DocumentVersion.new(document_version_params)

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
    params.require(:document_version).permit(:document_id, :content, :version_number, :description)
  end
end
