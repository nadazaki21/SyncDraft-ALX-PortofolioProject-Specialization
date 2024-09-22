import React, { useState } from 'react';
//import './MarkdownEditor.css'; // Assuming you'll style it using Tailwind

const MarkdownEditor = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);

    const documents = ["Document 1", "Document 2", "Document 3"];

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-100 p-4">
                <div className="flex items-center mb-6">
                    <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-xl font-bold">MarkDown</span>
                </div>
                <button className="w-full bg-gray-800 text-white py-2 px-4 rounded mb-4">New Document</button>
                <ul>
                    {documents.map((doc, index) => (
                        <li
                            key={index}
                            className={`py-2 px-4 rounded mb-2 cursor-pointer ${selectedDocument === index ? 'bg-white' : 'bg-gray-100'}`}
                            onClick={() => setSelectedDocument(index)}
                        >
                            {doc}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-3/4 bg-gray-50 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Untitled Document</h1>
                    <div className="flex items-center">
                        <i className="fas fa-user-circle text-2xl mr-2"></i>
                        <i className="fas fa-users text-2xl mr-2"></i>
                        <button className="bg-gray-200 text-gray-800 py-1 px-3 rounded mr-2">Share</button>
                        <button className="bg-gray-200 text-gray-800 py-1 px-3 rounded">Save</button>
                    </div>
                </div>
                <textarea className="w-full h-96 p-4 bg-white border rounded" placeholder="Start typing your Markdown here..."></textarea>
            </div>
        </div>
    );
};

export default MarkdownEditor;
