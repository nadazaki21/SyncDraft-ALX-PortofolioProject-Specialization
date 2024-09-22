import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill's styles
import Quill from 'quill';

const MarkdownEditor = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const quillRef = useRef(null); // Reference for the Quill editor
    const quillInstance = useRef(null); // Reference to store the Quill instance
    const documents = ["Document 1", "Document 2", "Document 3"];

    useEffect(() => {
        // Initialize Quill editor only if it hasn't been initialized yet
        if (!quillInstance.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'], // toggled buttons
                        ['link', 'image'], // add's image and link
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }], // dropdown with defaults
                        ['clean'] // remove formatting button
                    ],
                },
            });
        }
    }, []);

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
                <div ref={quillRef} className="h-96 bg-white border rounded"></div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
