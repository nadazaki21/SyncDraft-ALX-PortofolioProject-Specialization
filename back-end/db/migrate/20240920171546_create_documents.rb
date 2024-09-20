class CreateDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :documents do |t|
      t.string :title
      t.jsonb :content
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      # we use to_table as the fogein key here does not follow the convention naming
      # using this line instead :
      #t.references :user, null: false, foreign_key: true
      # will genearte a column called user_id by default 

      t.timestamps
    end
  end
end
