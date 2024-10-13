class DocumentBroadcastJob < ApplicationJob
  queue_as :default

  def perform(document_id:, changes:)
    Rails.logger.info("Broadcasting changes for Document ID: #{document_id}. Changes: #{changes}")

    # Ensure that the data being broadcast is structured correctly
    ActionCable.server.broadcast("document_#{document_id}", {
      type: 'update',
      changes: changes
    })
  end
end