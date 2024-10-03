class Request < ApplicationRecord
    belongs_to :user , foreign_key: 'user_id'
    belongs_to :document , foreign_key: 'document_id'

    enum permission: {viewer: 1 , editor: 2}

    validates :document, :user, :permission, presence: true

end