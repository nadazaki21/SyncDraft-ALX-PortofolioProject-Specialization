class DocumentBroadcastJob < ApplicationJob
  queue_as :default

  def perform(document_id:, changes:)

    redis_key_content = "document_#{document_id}_content"

    Rails.logger.info("Broadcasting changes for Document ID: #{document_id}")
   

    # Save the latest changes to Redis
    Redis.current.set(redis_key_content, changes)
    puts ("Redis key put")
    puts ("Redis key #{redis_key_content} set with value: #{Redis.current.get(redis_key_content)}")

    # Ensure that the data being broadcast is structured correctly
    ActionCable.server.broadcast("document_#{document_id}", changes)
  end
end