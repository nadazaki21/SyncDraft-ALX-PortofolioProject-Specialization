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
        new_permission = {access_type: params[:permission]}
        if permission.update(new_permission)
            render json: { message: 'Permission updated successfully' }, status: :ok
          else
            render json: permission.errors.full_messages, status: :unprocessable_entity
          end
    end

    def destroy
        permission_to_delete = Permission.find(params[:id])
      
        if permission_to_delete
          permission_to_delete.destroy
          render status: :no_content
        else
          render json: { error: "Permission to delete is not found" }, status: :not_found
        end
      end

    private

    def permission_params
        params.require(:permission).permit(:user , :document, :access_type)
    end

end