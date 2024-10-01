class DocumentVersion < ApplicationRecord
  belongs_to :document
  belongs_to :created_by, class_name: 'User'

  validates :content, presence: true
  validates :version_number, presence: true
  validates :change_description, presence: true
end
