import React from 'react';

const DocumentSharing = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">Document Sharing</h1>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Invite Collaborators</label>
                    <div className="flex">
                        <input type="email" placeholder="Enter email address" className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-400" />
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-r-md hover:bg-gray-600">Invite</button>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Current Collaborators</h2>
                    <div className="space-y-4">
                        {[{name: "John Doe", email: "john@example.com", role: "Owner"}, 
                          {name: "Jane Smith", email: "jane@example.com", role: "Editor"}, 
                          {name: "Bob Johnson", email: "bob@example.com", role: "Viewer"}].map((collaborator, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                                <div className="flex items-center">
                                    <img src="https://placehold.co/40x40" alt={`Avatar of ${collaborator.name}`} className="w-10 h-10 rounded-full mr-4" />
                                    <div>
                                        <p className="font-semibold">{collaborator.name}</p>
                                        <p className="text-gray-600">{collaborator.email}</p>
                                    </div>
                                </div>
                                <select className="border border-gray-300 rounded-md p-2 bg-white">
                                    <option>Owner</option>
                                    <option selected={collaborator.role === "Editor"}>Editor</option>
                                    <option selected={collaborator.role === "Viewer"}>Viewer</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-100 rounded-md">
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
