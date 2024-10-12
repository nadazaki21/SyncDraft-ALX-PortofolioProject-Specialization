RSpec.configure do |config|
    config.swagger_root = Rails.root.to_s + '/swagger'
  
    config.swagger_docs = {
      'v1/swagger.yaml' => {
        openapi: '3.0.1',
        info: {
          title: 'Requests API',
          version: 'v1'
        },
        paths: {},
        components: {
          securitySchemes: {
            bearerAuth: {
              type: :http,
              scheme: :bearer,
              bearerFormat: :JWT
            }
          }
        },
        security: [{ bearerAuth: [] }]
      }
    }
end
  