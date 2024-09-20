class CreatePermissions < ActiveRecord::Migration[7.1]
  def change
    create_table :permissions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :document, null: false, foreign_key: true
      t.string :access_type

      t.timestamps
    end
  end
end
