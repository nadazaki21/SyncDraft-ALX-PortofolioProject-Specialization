# spec/requests/api/documents_spec.rb

require 'rails_helper'

RSpec.describe "Api::Documents", type: :request do
  let(:user) { create(:user) } # Assume you have a user factory
  let(:valid_attributes) { { document: { title: "Sample Document", content: "This is a sample document." } } }
  let(:invalid_attributes) { { document: { title: "", content: "" } } }
  let!(:document) { create(:document, valid_attributes[:document].merge(created_by_id: user.id)) } # Create a document for testing

  before do
    # Simulate user authentication
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
    allow_any_instance_of(ApplicationController).to receive(:authenticate_request).and_return(true)
  end

  describe "GET /api/documents" do
    it "returns a list of documents" do
      get "/api/documents"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(document.title)
    end
  end

  describe "GET /api/documents/recent" do
    it "returns a list of recent documents" do
      get "/api/documents/recent"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(document.title)
    end
  end

  describe "GET /api/user/activity" do
    it "returns the user's document activity" do
      get "/api/user/activity"
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['documents_created']).to eq(1)
      expect(json_response['documents_shared']).to eq(0) # Adjust based on your setup
    end
  end

  describe "POST /api/documents" do
    context "with valid parameters" do
      it "creates a new document" do
        expect {
          post "/api/documents", params: valid_attributes
        }.to change(Document, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.body).to include("Sample Document")
      end
    end

    context "with invalid parameters" do
      it "does not create a new document" do
        expect {
          post "/api/documents", params: invalid_attributes
        }.to change(Document, :count).by(0)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.body).to include("can't be blank") # Adjust based on error messages
      end
    end
  end

  describe "GET /api/documents/:id" do
    it "returns the document" do
      get "/api/documents/#{document.id}"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(document.content)
    end
  end

  describe "PUT /api/documents/:id" do
    context "with valid parameters" do
      it "updates the document" do
        put "/api/documents/#{document.id}", params: { document: { title: "Updated Title" } }
        expect(response).to have_http_status(:ok)
        expect(document.reload.title).to eq("Updated Title")
      end
    end

    context "with invalid parameters" do
      it "does not update the document" do
        put "/api/documents/#{document.id}", params: { document: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    it "forbids unauthorized update attempts" do
      another_user = create(:user)
      allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(another_user)

      put "/api/documents/#{document.id}", params: { document: { title: "Unauthorized Update" } }
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/documents/:id" do
    it "deletes the document" do
      expect {
        delete "/api/documents/#{document.id}"
      }.to change(Document, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "forbids unauthorized delete attempts" do
      another_user = create(:user)
      allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(another_user)

      delete "/api/documents/#{document.id}"
      expect(response).to have_http_status(:forbidden)
    end
  end
end
