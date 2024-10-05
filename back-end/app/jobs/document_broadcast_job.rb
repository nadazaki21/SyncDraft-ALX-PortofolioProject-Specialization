class DocumentBroadcastJob < ApplicationJob
  queue_as :default

  def perform(*args)
     # Broadcast the changes to the document's WebSocket channel
     ActionCable.server.broadcast("document_#{data[:document_id]}", changes)
  end
end
