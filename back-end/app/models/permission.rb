class Permission < ApplicationRecord
    belongs_to :document
    belongs_to :user
  
    enum access_type: { viewer: 1, editor: 2 }
end
