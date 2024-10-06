class DocumentBroadcastJob < ApplicationJob
  queue_as :default

  def perform(data)
     changes = data[:changes]
     # Broadcast the changes to the document's WebSocket channel
     ActionCable.server.broadcast("document_#{data[:document_id]}", changes: changes)
  end
end
