class Document < ApplicationRecord
    # many to many relation
    has_many :permissions
    has_many :users , through: :permissions

    # one to many relation
    belongs_to :creator, class_name: 'User', foreign_key: :created_by
end