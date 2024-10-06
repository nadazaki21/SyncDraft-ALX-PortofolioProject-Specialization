import React, { useEffect, useState } from 'react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const DocumentSharing = () => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('Viewer');
    const [documentId, setDocumentId] = useState(localStorage.getItem('selectedDocumentId'));
    const [collaborators, setCollaborators] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]); // New state for pending invitations
    const [documentTitle, setDocumentTitle] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('selectedDocumentId');
        setDocumentId(id);
        fetchCollaborators(id); // Fetch collaborators on load
    }, []);

    // Fetch collaborators for the document
    const fetchCollaborators = async (documentId) => {
        try {
            const token = localStorage.getItem('jwtToken');
            // Fetching the document name
            const documentResponse = await axios.get(`${baseURL}/api/documents/${documentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDocumentTitle(documentResponse.data.title); // Assuming the document object has a 'name' property
            console.log('Document Title:', documentResponse.data.title);
            const response = await axios.get(`${baseURL}/permissions/${documentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const permissions = response.data;
            // console.log('Collaborators:', permissions);

            // Fetch user details for each permission
            const collaboratorPromises = permissions.map(async (permission) => {
                const userResponse = await axios.get(`${baseURL}/users/${permission.user_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const user = userResponse.data;
                // console.log('User:', user);
                // console.log('Permission:', permission);
                return {
                    id: permission.id,
                    userId: permission.user_id,
                    name: user.name,
                    email: user.email,
                    role: permission.access_type === "viewer" ? 'Viewer' : 'Editor', // Map permission to a readable string
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
        console.log('Document Title:', documentTitle);
        const requestData = {
            request: {
                document: documentId,
                user: email,
                permission: permissionType,
                document_title: documentTitle, // Include the document title here
            },
        };
        console.log('Request Data:', requestData);

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post(`${baseURL}/requests`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Success handling
            if (response.status === 201) {
                console.log('Invitation sent:', response.data);
                alert('Invitation sent successfully!');
                fetchCollaborators(documentId); // Refresh collaborators list
            }

            // Add to pending invitations
            setPendingInvitations((prev) => [
                ...prev,
                { email, role: permission, status: 'Pending' },
            ]);

            fetchCollaborators(documentId); // Refresh collaborators list
        } catch (error) {
            // Error handling
            if (error.response) {
                alert(`Error sending invitation: ${error.response.data.error || 'Something went wrong'}`);
            } else {
                console.error('Error:', error);
            }
        }
    };

    // Update permission for a collaborator
    const handlePermissionChange = async (collaboratorId, newPermission) => {
        const permissionType = newPermission === 'Viewer' ? 1 : 2;

        // Optimistically update the collaborator's role in the state
        const updatedCollaborators = collaborators.map(collaborator =>
            collaborator.id === collaboratorId
                ? { ...collaborator, role: newPermission }
                : collaborator
        );

        setCollaborators(updatedCollaborators);

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.put(`${baseURL}/permissions/${collaboratorId}`, {
                permission: permissionType,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Permission updated successfully:', response.data);
            // Optionally refresh collaborators or handle any other logic here
            // fetchCollaborators(documentId);
        } catch (error) {
            console.error('Error updating permission:', error);
            // Revert to previous state if there's an error
            setCollaborators(collaborators); // Reset to original state if error occurs
            alert('Failed to update permission. Please try again.'); // Notify user of failure
        }
    };

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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 text-left">Document Sharing</h1>
                    <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800" onClick={() => window.location.href = '/editor'}>Back to Editor</button>
                </div>

                {/* Document Name Section */}
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Document Title</label>
                    <h2 className="text-2xl font-bold text-gray-800">{documentTitle}</h2>
                </div>

                {/* Invite Collaborators Section */}
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

                {/* Current Collaborators Section */}
                <div className="mb-8">
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
                                        onChange={(e) => handlePermissionChange(collaborator.id, e.target.value)}
                                        value={collaborator.role}
                                    >
                                        <option value="Viewer">Viewer</option>
                                        <option value="Editor">Editor</option>
                                    </select>
                                    <button
                                        onClick={() => handleDeleteCollaborator(collaborator.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Pending Invitations Section */}
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Pending Invitations</h2>
                {pendingInvitations.map((invitation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-yellow-300 rounded-md bg-yellow-50 shadow-sm">
                        <div className="flex items-center">
                            <div>
                                <p className="font-semibold text-gray-700">{invitation.email}</p>
                                <p className="text-sm text-gray-500">Permission: <span className="font-semibold text-gray-700">{invitation.role}</span></p>
                                <p className="text-sm text-gray-500">Status: <span className="font-semibold text-yellow-700">{invitation.status}</span></p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Permission Levels Section */}
                <div className="p-4 bg-gray-50 rounded-md">
                    <h3 className="font-semibold mb-2 text-gray-800">Permission Levels</h3>
                    <p className="text-gray-700"><strong>Owner:</strong> Full access, can manage collaborators</p>
                    <p className="text-gray-700"><strong>Editor:</strong> Can edit and comment on the document</p>
                    <p className="text-gray-700"><strong>Viewer:</strong> Can only view and comment on the document</p>
                </div>
            </div>
        </div>
    );
}

export default DocumentSharing;