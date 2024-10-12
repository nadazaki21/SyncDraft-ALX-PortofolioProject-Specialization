# spec/requests/users_spec.rb

require 'rails_helper'

RSpec.describe "Users", type: :request do
  let(:valid_attributes) { { user: { name: "John Doe", email: "john@example.com", password: "password" } } }
  let(:invalid_attributes) { { user: { name: "", email: "invalid_email", password: "" } } }
  let!(:user) { User.create!(valid_attributes[:user]) } # Create a user for testing

  describe "GET /users/:id" do
    it "returns the user" do
      get "/users/#{user.id}"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(user.name)
      expect(response.body).to include(user.email)
    end

    it "returns not found for an invalid user" do
      get "/users/99999" # Assume this ID does not exist
      expect(response).to have_http_status(:not_found)
      expect(response.body).to include("User not Found")
    end
  end

  describe "POST /users" do
    context "with valid parameters" do
      it "creates a new user" do
        expect {
          post "/users", params: valid_attributes
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.body).to include("John Doe")
      end
    end

    context "with invalid parameters" do
      it "does not create a new user" do
        expect {
          post "/users", params: invalid_attributes
        }.to change(User, :count).by(0)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.body).to include("can't be blank") # Adjust based on error messages
      end
    end
  end

  describe "DELETE /users/:id" do
    it "deletes the user" do
      expect {
        delete "/users/#{user.id}"
      }.to change(User, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found for an invalid user" do
      delete "/users/99999" # Assume this ID does not exist
      expect(response).to have_http_status(:not_found)
      expect(response.body).to include("User not found")
    end
  end
end
