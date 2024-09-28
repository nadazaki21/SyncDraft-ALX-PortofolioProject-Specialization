import React, { useEffect, useState } from 'react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const DocumentSharing = () => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('Viewer');
    const [documentId, setDocumentId] = useState(localStorage.getItem('selectedDocumentId'));
    const [collaborators, setCollaborators] = useState([]);

    useEffect(() => {
        const id = localStorage.getItem('selectedDocumentId');
        setDocumentId(id);
        fetchCollaborators(id); // Fetch collaborators on load
    }, []);

    // Fetch collaborators for the document
    const fetchCollaborators = async (documentId) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get(`${baseURL}/permissions/${documentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const permissions = response.data;
    
            // Fetch user details for each permission
            const collaboratorPromises = permissions.map(async (permission) => {
                const userResponse = await axios.get(`${baseURL}/users/${permission.user_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const user = userResponse.data;
    
                return {
                    id: permission.id,
                    userId: permission.user_id,
                    name: user.name,
                    email: user.email,
                    role: permission.role === 1 ? 'Viewer' : 'Editor', // Map permission to a readable string
                };
            });
    
            const collaboratorsData = await Promise.all(collaboratorPromises);
            setCollaborators(collaboratorsData);
        } catch (error) {
            console.error('Error fetching collaborators:', error);
        }
    };
    

    const handleInvite = async () => {
        const permissionType = permission === 'Viewer' ? 1 : 2;

        const requestData = {
            request: {
                document: documentId,
                user: email,
                permission: permissionType,
            },
        };

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post(`${baseURL}/requests`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Invitation sent:', response.data);
            fetchCollaborators(documentId); // Refresh collaborators list
        } catch (error) {
            console.error('Error sending invitation:', error);
        }
    };

    // Update permission for a collaborator
    const handlePermissionChange = async (collaboratorId, newPermission) => {
        const permissionType = newPermission === 'Viewer' ? 1 : 2;
    
        // Optimistically update the collaborator's role in the state
        setCollaborators(prevCollaborators =>
            prevCollaborators.map(collaborator =>
                collaborator.id === collaboratorId
                    ? { ...collaborator, role: newPermission }
                    : collaborator
            )
        );
    
        try {
            const token = localStorage.getItem('jwtToken');
            await axios.put(`${baseURL}/permissions/${collaboratorId}`, {
                permission: permissionType,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            // You can also refresh collaborators here if needed
            // fetchCollaborators(documentId);
        } catch (error) {
            console.error('Error updating permission:', error);
        }
    };
    

    // Delete a collaborator
    // Delete a collaborator
    const handleDeleteCollaborator = async (collaboratorId) => {
        // Optimistically update the collaborators state
        setCollaborators(prevCollaborators =>
            prevCollaborators.filter(collaborator => collaborator.id !== collaboratorId)
        );

        try {
            const token = localStorage.getItem('jwtToken');
            await axios.delete(`${baseURL}/permissions/${collaboratorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            // Optionally refresh the collaborators list if needed
            // fetchCollaborators(documentId);
        } catch (error) {
            console.error('Error deleting collaborator:', error);
            // If there's an error, you may want to revert the optimistic update
            fetchCollaborators(documentId); // Re-fetch collaborators on error
        }
    };

// In the return statement, the rendering remains the same


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Document Sharing</h1>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Invite Collaborators</label>
                    <div className="flex">
                        <input 
                            type="email" 
                            placeholder="Enter email address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                        />
                        <span className="p-2 bg-gray-200 text-gray-700">As</span>
                        <select 
                            value={permission} 
                            onChange={(e) => setPermission(e.target.value)} 
                            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="Viewer">Viewer</option>
                            <option value="Editor">Editor</option>
                        </select>
                        <button 
                            onClick={handleInvite} 
                            className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 transition"
                        >
                            Invite
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Current Collaborators</h2>
                    <div className="space-y-4">
                    {collaborators.map((collaborator, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-300 rounded-md bg-gray-50 shadow-sm">
                            <div className="flex items-center">
                                <div>
                                    <p className="font-semibold text-gray-700">{collaborator.name}</p>
                                    <p className="text-gray-600">{collaborator.email}</p>
                                    <p className="text-sm text-gray-500">Permission: <span className="font-semibold text-gray-700">{collaborator.role}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <select 
                                    className="mr-2 border border-gray-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={collaborator.role}
                                    onChange={(e) => handlePermissionChange(collaborator.id, e.target.value)}
                                >
                                    <option value="Viewer">Viewer</option>
                                    <option value="Editor">Editor</option>
                                </select>
                                <button 
                                    onClick={() => handleDeleteCollaborator(collaborator.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                                >
                                    x
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                    <h3 className="font-semibold mb-2 text-gray-800">Permission Levels</h3>
                    <p><strong>Owner:</strong> Full access, can manage collaborators</p>
                    <p><strong>Editor:</strong> Can edit and comment on the document</p>
                    <p><strong>Viewer:</strong> Can only view and comment on the document</p>
                </div>
            </div>
        </div>
    );
}

export default DocumentSharing;
