class RemoveDescriptionFromDocumentVersions < ActiveRecord::Migration[6.1]
  def change
    remove_column :document_versions, :description, :string
  end
end