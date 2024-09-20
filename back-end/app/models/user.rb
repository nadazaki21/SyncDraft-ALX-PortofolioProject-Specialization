class User < ApplicationRecord
    # many to many relation
    has_many :permissions
    has_many :documents, through: :permissions

    # one to many relation with documents  
    has_many :created_documents, class_name: 'Document', foreign_key: :created_by
end