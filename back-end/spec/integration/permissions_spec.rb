# spec/integration/permissions_spec.rb

require 'swagger_helper'

RSpec.describe 'Permissions API', type: :request do
  path '/permissions' do
    post 'Creates a permission' do
      tags 'Permissions'
      consumes 'application/json'
      produces 'application/json'
      
      parameter name: :permission, in: :body, required: true, schema: {
        type: :object,
        properties: {
          user_id: { type: :integer },
          document_id: { type: :integer },
          access_type: { type: :string }
        },
        required: %w[user_id document_id access_type]
      }

      response '201', 'permission created' do
        let(:permission) { { user_id: 1, document_id: 1, access_type: 'editor' } }
        run_test!
      end

      response '422', 'invalid request' do
        let(:permission) { { user_id: nil } }
        run_test!
      end
    end
  end

  path '/documents/{id}/permissions' do
    get 'Retrieves permissions for a document' do
      tags 'Permissions'
      produces 'application/json'
      
      parameter name: :id, in: :path, type: :integer, required: true, description: 'Document ID'

      response '200', 'permissions found' do
        let(:id) { Document.create!(created_by_id: 1).id }
        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data).to be_an(Array)
        end
      end

      response '404', 'permissions not found' do
        let(:id) { 0 } # Non-existent document
        run_test!
      end
    end
  end

  path '/permissions/{id}' do
    patch 'Updates a permission' do
      tags 'Permissions'
      consumes 'application/json'
      produces 'application/json'
      
      parameter name: :id, in: :path, type: :integer, required: true, description: 'Permission ID'
      parameter name: :permission, in: :body, required: true, schema: {
        type: :object,
        properties: {
          access_type: { type: :string }
        },
        required: ['access_type']
      }

      response '200', 'permission updated' do
        let(:id) { Permission.create!(user_id: 1, document_id: 1, access_type: 'editor').id }
        let(:permission) { { access_type: 'viewer' } }
        run_test!
      end

      response '403', 'not authorized' do
        let(:id) { Permission.create!(user_id: 1, document_id: 1, access_type: 'editor').id }
        let(:permission) { { access_type: 'editor' } }
        run_test!
      end

      response '404', 'permission not found' do
        let(:id) { 0 } # Non-existent permission
        let(:permission) { { access_type: 'editor' } }
        run_test!
      end
    end

    delete 'Deletes a permission' do
      tags 'Permissions'
      produces 'application/json'
      
      parameter name: :id, in: :path, type: :integer, required: true, description: 'Permission ID'

      response '204', 'permission deleted' do
        let(:id) { Permission.create!(user_id: 1, document_id: 1, access_type: 'editor').id }
        run_test!
      end

      response '403', 'not authorized' do
        let(:id) { Permission.create!(user_id: 1, document_id: 1, access_type: 'editor').id }
        run_test!
      end

      response '404', 'permission not found' do
        let(:id) { 0 } # Non-existent permission
        run_test!
      end
    end
  end
end
