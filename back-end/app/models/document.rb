class Document < ApplicationRecord
    # many to many relation
    has_many :permissions, dependent: :destroy
    has_many :users , through: :permissions

    # one to one relation with requests
    has_many :requests, dependent: :destroy  # there could be several requests to several users on the same document
    has_many :document_versions, dependent: :destroy # there could be several versions of the same document
    # one to many relation
    belongs_to :creator, class_name: 'User', foreign_key: :created_by_id
end