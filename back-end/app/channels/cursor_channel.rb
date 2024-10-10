class CursorChannel < ApplicationCable::Channel
  def subscribed
    stream_from "cursor_document_#{params[:document_id]}"
  end

  def unsubscribed
    # Broadcast that the user has disconnected (optional)
  end

  # Handle incoming cursor updates
  def update_cursor(data)
    document_id = params[:document_id] # Get document_id from params
    user_id = data['user_id']           # Extract user_id from data
    user_name = data['user_name']       # Extract user_name from data
    index = data['index']               # Extract the cursor index
    color = data['color']               # Extract color data

    if document_id.blank? || user_id.blank? || index.blank?
      Rails.logger.error("Missing document_id, user_id, or index in data")
      return
    end

    CursorBroadcastJob.perform_later(
      document_id: document_id,
        user_id: user_id,
        user_name: user_name,
        index: index,
        color: color
    )
  end
end
