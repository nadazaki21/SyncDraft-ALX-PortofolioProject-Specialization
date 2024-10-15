# spec/controllers/api/document_versions_controller_spec.rb
require 'rails_helper'

RSpec.describe Api::DocumentVersionsController, type: :controller do
  let(:user) { create(:user) }
  let(:document) { create(:document, created_by: user) }
  let(:document_version) { create(:document_version, document: document, created_by: user) }
  
  before do
    # Simulate user authentication
    allow(controller).to receive(:current_user).and_return(user)
    allow(controller).to receive(:authenticate_request).and_return(true)
  end

  describe 'GET #index' do
    it 'returns a list of document versions for the specified document' do
      create(:document_version, document: document)
      create(:document_version, document: document)

      get :index, params: { document_id: document.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).size).to eq(2)
    end

    it 'returns an empty array if no versions exist for the document' do
      get :index, params: { document_id: document.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([])
    end
  end

  describe 'GET #show' do
    it 'returns the requested document version' do
      get :show, params: { id: document_version.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['id']).to eq(document_version.id)
    end

    it 'returns a 404 if the document version does not exist' do
      get :show, params: { id: 999 }

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)['error']).to eq('Document version not found')
    end
  end

  describe 'POST #create' do
    it 'creates a new document version if authorized' do
      expect {
        post :create, params: { document_version: { document_id: document.id, content: 'Version content', version_number: 1 } }
      }.to change(DocumentVersion, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['content']).to eq('Version content')
    end

    it 'returns a forbidden error if the user is not authorized' do
      another_user = create(:user)
      allow(controller).to receive(:current_user).and_return(another_user)

      post :create, params: { document_version: { document_id: document.id, content: 'Version content', version_number: 1 } }

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['error']).to eq('You are not authorized to create a document version')
    end

    it 'returns a not found error if the document does not exist' do
      post :create, params: { document_version: { document_id: 999, content: 'Version content', version_number: 1 } }

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)['error']).to eq('Document not found')
    end
  end

  describe 'PATCH/PUT #update' do
    it 'updates the document version if the user is the creator' do
      patch :update, params: { id: document_version.id, document_version: { content: 'Updated content' } }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['content']).to eq('Updated content')
    end

    it 'returns a forbidden error if the user is not the creator' do
      another_user = create(:user)
      document_version.update(created_by: another_user)

      patch :update, params: { id: document_version.id, document_version: { content: 'Updated content' } }

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['error']).to eq('Only the creator can update this version.')
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes the document version if the user is the creator' do
      delete :destroy, params: { id: document_version.id }

      expect(response).to have_http_status(:no_content)
      expect(DocumentVersion.exists?(document_version.id)).to be_falsey
    end

    it 'returns a forbidden error if the user is not the creator' do
      another_user = create(:user)
      document_version.update(created_by: another_user)

      delete :destroy, params: { id: document_version.id }

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['error']).to eq('Only the creator can delete this version.')
    end
  end

  describe 'GET #compare' do
    let(:version1) { create(:document_version, document: document, content: '{"ops":[{"insert":"first version"}]}') }
    let(:version2) { create(:document_version, document: document, content: '{"ops":[{"insert":"second version"}]}') }

    it 'compares two document versions and returns the differences' do
      get :compare, params: { document_id: document.id, version1: version1.id, version2: version2.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['diffs']).to be_present
    end

    it 'returns a not found error if the document is not found' do
      get :compare, params: { document_id: 999, version1: version1.id, version2: version2.id }

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)['error']).to eq('Document not found')
    end

    it 'returns a not found error if one of the versions is not found' do
      get :compare, params: { document_id: document.id, version1: version1.id, version2: 999 }

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)['error']).to eq('One or both versions not found')
    end
  end
end
