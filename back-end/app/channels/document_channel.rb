class DocumentChannel < ApplicationCable::Channel
  #  logic for handling connections and broadcasting changes.

  # called when the client subscribes to the channel 
  def subscribed
    stream_from "document_#{params[:document_id]}"
  end

  # called when the client disconnects from  the channel 
  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  # This method handles incoming messages from the client. 
  # send message to all subsucribers of the channel 
  def send_message(data)
    ActionCable.server.broadcast("document_#{params[:document_id]}", message: data['message'])
  end


  def update(data)
    document_id = data['document_id'] # or data[:document_id]
    changes = data['changes']          # or data[:changes]
  
    if document_id.blank? || changes.blank?
      Rails.logger.error("Missing document_id or changes in data")
      return
    end
  
    DocumentBroadcastJob.perform_later(document_id: document_id, changes: changes)
  end


end
