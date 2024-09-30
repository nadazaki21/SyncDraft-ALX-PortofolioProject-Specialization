class AddDescriptionToDocumentVersions < ActiveRecord::Migration[6.0]
  def change
    add_column :document_versions, :description, :string
  end
end