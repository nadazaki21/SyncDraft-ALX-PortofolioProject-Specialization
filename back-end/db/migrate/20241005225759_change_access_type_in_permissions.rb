class ChangeAccessTypeInPermissions < ActiveRecord::Migration[7.1] # Adjust version if necessary
  def up
    # Convert string values to integers
    change_column :permissions, :access_type, :integer, using: "CASE access_type WHEN 'viewer' THEN 1 WHEN 'editor' THEN 2 ELSE NULL END"
  end

  def down
    # Rollback: convert integers back to strings
    change_column :permissions, :access_type, :string, using: "CASE access_type WHEN 1 THEN 'viewer' WHEN 2 THEN 'editor' ELSE NULL END"
  end
end