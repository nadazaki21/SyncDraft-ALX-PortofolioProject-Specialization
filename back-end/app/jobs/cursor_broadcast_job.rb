class CursorBroadcastJob < ApplicationJob
  queue_as :default

  def perform(document_id:, user_id:, user_name:, index:, color:)
    Rails.logger.info("Broadcasting changes for Cursor ID: #{document_id}")

    cursor = {
      user_id: user_id,
      user_name: user_name,
      index: index,
      color: color
    }
    ActionCable.server.broadcast("document_#{document_id}", cursor)
  end
end
