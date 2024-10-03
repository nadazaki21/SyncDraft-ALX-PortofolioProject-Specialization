class PermissionsController < ApplicationController
    
    def create

        permission = Permission.new(access_type: permission_params[:access_type], user_id: permission_params[:user], document_id: permission_params[:document])

        if permission.save
            render json: permission, status: :created
        else
            render json: permission.errors.full_messages, status: :unprocessable_entity
        end
    end


    def show
        permissions = Permission.where(document_id: params[:id])
        if permissions.any?
          render json: permissions, status: :ok
        else
          render json: { message: 'No permissions found for this document' }, status: :not_found
        end
    end

    def update
        permission = Permission.find(params[:id])
        
        # Check if the current user is the creator of the document associated with the permission
        document = Document.find(permission.document_id) # Get the document associated with the permission
      
        if document.created_by_id == current_user.id
          new_permission = { access_type: params[:permission] }
      
          if permission.update(new_permission)
            render json: { message: 'Permission updated successfully' }, status: :ok
          else
            render json: { errors: permission.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'You are not authorized to update this permission' }, status: :forbidden
        end
    end

    def destroy
        permission_to_delete = Permission.find(params[:id])
        document = Document.find(permission_to_delete.document_id) # Get the document associated with the permission
      
        # Check if the current user is the creator of the document
        if document.created_by_id == current_user.id
          permission_to_delete.destroy
          render status: :no_content
        else
          render json: { error: 'You are not authorized to delete this permission' }, status: :forbidden
        end
    rescue ActiveRecord::RecordNotFound
        render json: { error: 'Permission to delete is not found' }, status: :not_found
    end

    private

    def permission_params
        params.require(:permission).permit(:user , :document, :access_type)
    end

end