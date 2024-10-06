# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_10_06_002118) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "document_versions", force: :cascade do |t|
    t.bigint "document_id", null: false
    t.jsonb "content", null: false
    t.integer "version_number", null: false
    t.bigint "created_by_id"
    t.text "change_description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_document_versions_on_created_by_id"
    t.index ["document_id", "version_number"], name: "index_document_versions_on_doc_id_and_version_number", unique: true
    t.index ["document_id"], name: "index_document_versions_on_document_id"
  end

  create_table "documents", force: :cascade do |t|
    t.string "title"
    t.jsonb "content"
    t.bigint "created_by_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_documents_on_created_by_id"
  end

  create_table "permissions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "document_id", null: false
    t.integer "access_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_id"], name: "index_permissions_on_document_id"
    t.index ["user_id"], name: "index_permissions_on_user_id"
  end

  create_table "requests", force: :cascade do |t|
    t.integer "permission"
    t.bigint "document_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "document_title"
    t.index ["document_id"], name: "index_requests_on_document_id"
    t.index ["user_id"], name: "index_requests_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "document_versions", "documents", on_delete: :cascade
  add_foreign_key "document_versions", "users", column: "created_by_id"
  add_foreign_key "documents", "users", column: "created_by_id"
  add_foreign_key "permissions", "documents"
  add_foreign_key "permissions", "users"
  add_foreign_key "requests", "documents"
  add_foreign_key "requests", "users"
end
