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
    document = Document.find(document_version_params[:document_id])
  
    # Check if the current user is the creator of the document or has the editor role
    if current_user.id == document.created_by_id || document.permissions.exists?(user_id: current_user.id, access_type: :editor)
      @document_version = DocumentVersion.new(document_version_params)
      @document_version.created_by_id = current_user.id # Set the creator to the current user
  
      if @document_version.save
        render json: @document_version, status: :created
      else
        render json: @document_version.errors, status: :unprocessable_entity
      end
    else
      render json: { error: 'You are not authorized to create a document version' }, status: :forbidden
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Document not found' }, status: :not_found
  end

  # PATCH/PUT /document_versions/:id
  def update
    # Ensure only the creator can update the version
    if @document_version.created_by_id != current_user.id
      return render json: { error: 'Only the creator can update this version.' }, status: :forbidden
    end

    if @document_version.update(document_version_params)
      render json: @document_version
    else
      render json: @document_version.errors, status: :unprocessable_entity
    end
  end

  # DELETE /document_versions/:id
  def destroy
    # Ensure only the creator can delete the version
    if @document_version.created_by_id != current_user.id
      return render json: { error: 'Only the creator can delete this version.' }, status: :forbidden
    end

    @document_version.destroy
    head :no_content
  end

  # GET /document_versions/:id/compare
  def compare
    document_id = params[:document_id]
    version1_id = params[:version1]
    version2_id = params[:version2]

    # Fetch the document and the versions to compare
    document = Document.find_by(id: document_id)
    
    if document.nil?
      render json: { error: 'Document not found' }, status: :not_found
      return
    end

    version1 = document.document_versions.find_by(id: version1_id)
    version2 = document.document_versions.find_by(id: version2_id)

    if version1.nil? || version2.nil?
      render json: { error: 'One or both versions not found' }, status: :not_found
      return
    end

    # Parse the Delta JSON content
    delta1 = JSON.parse(version1.content)
    delta2 = JSON.parse(version2.content)

    # Compare the two Deltas
    diffs = JsonDiff.diff(delta1, delta2)

    # Format the diffs for the response
    formatted_diffs = diffs.map do |change|
      {
        content: change,
        type: change['op'] == 'add' ? 'added' : change['op'] == 'remove' ? 'removed' : 'changed'
      }
    end

    render json: { diffs: formatted_diffs }, status: :ok
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

  # Method to compare content of two versions using Diffy
  def generate_diffs(content1, content2)
    Diffy::Diff.new(content1, content2, context: 2).to_s(:html)
  end
end
