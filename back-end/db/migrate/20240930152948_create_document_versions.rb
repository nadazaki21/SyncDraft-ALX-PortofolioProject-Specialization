class CreateDocumentVersions < ActiveRecord::Migration[7.1]
  def change
    create_table :document_versions do |t|
      t.references :document, null: false, foreign_key: { on_delete: :cascade }
      t.jsonb :content, null: false
      t.integer :version_number, null: false
      t.references :created_by, foreign_key: { to_table: :users }
      t.text :change_description
      t.timestamps
    end

    # Adding a unique index for document_id and version_number
    add_index :document_versions, [:document_id, :version_number], unique: true, name: 'index_document_versions_on_doc_id_and_version_number'
  end
end