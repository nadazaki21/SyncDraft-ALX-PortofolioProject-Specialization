import React from 'react';

const DocumentSharing = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100"> {/* Calmer background */}
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Document Sharing</h1> {/* Enhanced title color */}
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Invite Collaborators</label>
                    <div className="flex">
                        <input 
                            type="email" 
                            placeholder="Enter email address" 
                            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                        /> {/* Adjusted focus color */}
                        <button className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 transition">Invite</button> {/* Button color changes */}
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Current Collaborators</h2> {/* Enhanced subheading color */}
                    <div className="space-y-4">
                        {[{name: "John Doe", email: "john@example.com", role: "Owner"}, 
                          {name: "Jane Smith", email: "jane@example.com", role: "Editor"}, 
                          {name: "Bob Johnson", email: "bob@example.com", role: "Viewer"}].map((collaborator, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-300 rounded-md bg-gray-50 shadow-sm">
                                <div className="flex items-center">
                                    <div>
                                        <p className="font-semibold text-gray-700">{collaborator.name}</p> {/* Added color to name */}
                                        <p className="text-gray-600">{collaborator.email}</p>
                                        <p className="text-sm text-gray-500">Permission: <span className="font-semibold text-gray-700">{collaborator.role}</span></p> {/* Added permission info */}
                                    </div>
                                </div>
                                <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition">
                                    x
                                </button> {/* 'x' button to remove collaborator */}
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
