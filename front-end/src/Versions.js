import React from 'react';

const DocumentVersionControl = () => {
    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Document Version Control</h1>
                <button className="bg-gray-700 text-white px-4 py-2 rounded">Back to Editor</button>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow mb-4">
                <h2 className="text-xl font-semibold mb-4">Version History</h2>
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <img src="https://placehold.co/40" alt="User avatar" className="w-10 h-10 rounded-full mr-4"/>
                        <div className="flex-1">
                            <p className="font-semibold">Current Version</p>
                            <p className="text-sm text-gray-600">Edited by John Doe • May 15, 2025 at 14:30</p>
                        </div>
                        <button className="bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2">View</button>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src="https://placehold.co/40" alt="User avatar" className="w-10 h-10 rounded-full mr-4"/>
                        <div className="flex-1">
                            <p className="font-semibold">Version 2</p>
                            <p className="text-sm text-gray-600">Edited by Jane Smith • May 14, 2025 at 10:15</p>
                        </div>
                        <button className="bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2">View</button>
                        <button className="bg-gray-400 text-gray-800 px-4 py-2 rounded">Restore</button>
                    </div>
                    <div className="flex items-center">
                        <img src="https://placehold.co/40" alt="User avatar" className="w-10 h-10 rounded-full mr-4"/>
                        <div className="flex-1">
                            <p className="font-semibold">Version 1</p>
                            <p className="text-sm text-gray-600">Edited by John Doe • May 13, 2025 at 09:45</p>
                        </div>
                        <button className="bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2">View</button>
                        <button className="bg-gray-400 text-gray-800 px-4 py-2 rounded">Restore</button>
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Version Comparison</h2>
                <div className="flex mb-4">
                    <select className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2">
                        <option>Current Version</option>
                    </select>
                    <select className="bg-gray-300 text-gray-800 px-4 py-2 rounded">
                        <option>Version 2</option>
                    </select>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                    <p className="text-green-600">+ This is a new line added in the latest version.</p>
                    <p className="text-gray-800">This is an unchanged line.</p>
                    <p className="text-red-600">- This line was removed in the latest version.</p>
                    <p className="text-gray-800">Another unchanged line.</p>
                    <p className="text-yellow-600">~ This line was modified in the latest version.</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentVersionControl;
