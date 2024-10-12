require 'swagger_helper'

RSpec.describe 'Requests API', type: :request do
  path '/requests' do
    get('list user requests') do
      tags 'Requests'
      security [bearerAuth: []]
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array, items: { 
          type: :object, 
          properties: {
            id: { type: :integer },
            document_id: { type: :integer },
            user_id: { type: :integer },
            document_title: { type: :string },
            permission: { type: :string }
          },
          required: %w[id document_id user_id document_title permission]
        }

        let(:Authorization) { "Bearer <your_jwt_token>" }
        run_test!
      end

      response(404, 'no requests found') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        run_test!
      end
    end

    post('create request') do
      tags 'Requests'
      security [bearerAuth: []]
      consumes 'application/json'
      produces 'application/json'

      parameter name: :request, in: :body, schema: {
        type: :object,
        properties: {
          permission: { type: :string, example: 'read' },
          document: { type: :integer, example: 1 },
          user: { type: :string, example: 'user@example.com' }
        },
        required: %w[permission document user]
      }

      response(201, 'created') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        let(:request) { { permission: 'read', document: 1, user: 'user@example.com' } }
        run_test!
      end

      response(404, 'document not found') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        let(:request) { { permission: 'read', document: 999, user: 'user@example.com' } }
        run_test!
      end

      response(403, 'only the creator can send requests') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        let(:request) { { permission: 'write', document: 2, user: 'user@example.com' } }
        run_test!
      end

      response(422, 'user not found or request already exists') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        let(:request) { { permission: 'read', document: 1, user: 'unknown@example.com' } }
        run_test!
      end
    end
  end

  path '/requests/{id}' do
    delete('delete request') do
      tags 'Requests'
      security [bearerAuth: []]
      produces 'application/json'
      parameter name: :id, in: :path, type: :integer, required: true, description: 'Request ID'

      response(204, 'no content') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        let(:id) { Request.create(permission: 'read', document_id: 1, user_id: 1).id }
        run_test!
      end

      response(404, 'request not found') do
        let(:Authorization) { "Bearer <your_jwt_token>" }
        let(:id) { 999 }
        run_test!
      end
    end
  end
end
