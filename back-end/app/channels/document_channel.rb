class DocumentChannel < ApplicationCable::Channel
  #  logic for handling connections and broadcasting changes.

  # called when the client subscribes to the channel 
  def subscribed
    stream_from "document_#{params[:document_id]}"
    redis_key = "document_#{params[:document_id]}_subscribers"
    Redis.current.incr(redis_key)
  end

  # called when the client disconnects from  the channel 
  def unsubscribed
    redis_key = "document_#{params[:document_id]}_subscribers"
    subscriber_count = Redis.current.decr(redis_key)  # Decrement the subscriber count

    # If no more subscribers, remove the document's content from Redis
    if subscriber_count <= 0
      Redis.current.del("document_#{params[:document_id]}_content")
      Redis.current.del(redis_key)  # Clean up the subscriber count key as well
    end

  end

  # This method handles incoming messages from the client. 
  # send message to all subsucribers of the channel 
  # def send_message(data)
  #   ActionCable.server.broadcast("document_#{params[:document_id]}", message: data['message'])
  # end

  def update(data)
    document_id = data['document_id'] # or data[:document_id]
    changes = data['changes']          # or data[:changes]

    if document_id.blank? || changes.blank?
      Rails.logger.error("Missing document_id or changes in data")
      return
    end
    DocumentBroadcastJob.perform_later(document_id: document_id, changes: changes)
  end

  # def leave(data)
  #   redis_key = "document_#{document.id}_content"
  #   # Remove the Redis entry when the user leaves the editor
  #   ActionCable.server.redis.del(redis_key)
  # end

end
