class DocumentChannel < ApplicationCable::Channel
  # Logic for handling connections and broadcasting changes.

  # Called when the client subscribes to the channel 
  def subscribed
    # Access the user_id and user_name from params
    user_id = params[:user_id]
    user_name = params[:user_name]

    Rails.logger.info("User subscribed: #{user_name} (ID: #{user_id})")
    stream_from "document_#{params[:document_id]}"
    redis_key = "document_#{params[:document_id]}_subscribers"
    Redis.current.incr(redis_key)
  end

  # Called when the client disconnects from the channel 
  def unsubscribed
    # Notify other clients that the user has disconnected
    ActionCable.server.broadcast("document_#{params[:document_id]}", {
      type: 'user_disconnected',
      user_id: params[:user_id],     # Use params[:user_id]
      user_name: params[:user_name]  # Use params[:user_name]
    })
    
    redis_key = "document_#{params[:document_id]}_subscribers"
    # content_key = "document_#{params[:document_id]}_content"
  
    # Use Redis transaction to ensure atomic decrement and check
    Redis.current.multi do |multi|
      multi.decr(redis_key)           # Decrement the subscriber count
      multi.get(redis_key)            # Get the current count after decrement
    end.tap do |(_, subscriber_count)|
      subscriber_count = subscriber_count.to_i
  
      if subscriber_count <= 0
        # If no more subscribers, remove the document's content from Redis
        # Redis.current.del(content_key)
        Redis.current.del(redis_key)  # Clean up the subscriber count key as well
      end
    end
  end

  # This method handles incoming messages from the client. 
  # Send message to all subscribers of the channel 
  def send_message(data)
    ActionCable.server.broadcast("document_#{params[:document_id]}", message: data['message'])
  end

  # Handle incoming document updates
  def update(data)
    document_id = data['document_id'] # or data[:document_id]
    changes = data['changes']          # or data[:changes]

    if document_id.blank? || changes.blank?
      Rails.logger.error("Missing document_id or changes in data")
      return
    end

    # Offload the document update to a background job
    DocumentBroadcastJob.perform_later(document_id: document_id, changes: changes)
  end
  # Handle incoming cursor updates
  def cursor_update(data)
    document_id = data['document_id']   # Get document_id from params
    user_id = data['user_id']           # Extract user_id from data
    user_name = data['user_name']       # Extract user_name from data
    index = data['cursor_position']             # Extract the cursor index
    length = data['cursor_length']
    color = data['cursor_color']               # Extract color data

   # Ensure required fields are present
  if document_id.blank? || user_id.blank? || index.blank?
    Rails.logger.error("Missing document_id, user_id, or cursor_position in data: #{data.inspect}")
    return
  end

  # Log incoming data for debugging
  Rails.logger.info("Processing cursor update: document_id=#{document_id}, user_id=#{user_id}, user_name=#{user_name}, index=#{index}, length=#{length}, color=#{color}")

    # Directly broadcast cursor updates for immediate feedback
    ActionCable.server.broadcast("document_#{document_id}", {
      type: 'cursor_update',
      user_id: user_id,
      user_name: user_name,
      cursor_position: index,
      cursor_length: length,
      cursor_color: color
    })
  end
end
