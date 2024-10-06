class AddDocumentTitleToRequests < ActiveRecord::Migration[7.1]
  def change
    add_column :requests, :document_title, :string
  end
end
