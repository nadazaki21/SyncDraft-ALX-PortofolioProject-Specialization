import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill's styles
import Quill from 'quill';
import logo from './assets/logo.png';

const MarkdownEditor = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState([]); // State for documents
    const [documentName, setDocumentName] = useState('Untitled Document'); // State for document name
    const quillRef = useRef(null); // Reference for the Quill editor
    const quillInstance = useRef(null); // Reference to store the Quill instance

    useEffect(() => {
        // Initialize Quill editor only if it hasn't been initialized yet
        if (!quillInstance.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: [
                            [{ 'header': [1, 2, false] }], // Header options
                            ['bold', 'italic', 'underline'], // toggled buttons
                            ['link', 'image'], // add's image and link
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'color': [] }, { 'background': [] }], // dropdown with defaults
                            ['clean'] // remove formatting button
                        ],
                    },
                },
            });
        }
    }, []);

    useEffect(() => {
        // Fetch recent documents when the component mounts
        const fetchDocuments = async () => {
            try {
                const response = await fetch('YOUR_API_ENDPOINT_FOR_DOCUMENTS');
                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }
                const data = await response.json();
                setDocuments(data); // Assuming the data is an array of documents
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        // Fetch document name when a document is selected
        const fetchDocumentName = async () => {
            if (selectedDocument !== null) {
                try {
                    const response = await fetch(`YOUR_API_ENDPOINT_FOR_DOCUMENTS/${selectedDocument}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch document name');
                    }
                    const data = await response.json();
                    setDocumentName(data.title); // Assuming the document has a title field
                } catch (error) {
                    console.error('Error fetching document name:', error);
                }
            }
        };

        fetchDocumentName();
    }, [selectedDocument]);

    const handleSave = async () => {
        const delta = quillInstance.current.getContents(); // Get delta JSON

        // Call your API to save the document
        try {
            const response = await fetch('YOUR_API_ENDPOINT_HERE', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: delta,
                    documentId: selectedDocument, // Send the document ID if needed
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save document');
            }

            const result = await response.json();
            console.log('Document saved successfully:', result);
        } catch (error) {
            console.error('Error saving document:', error);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-100 p-4">
                <div className="flex items-center mb-6">
                    <img src={logo} alt="SyncDraft Logo" className="w-4 h-4 bg-gray-400 rounded-full mr-2"></img>
                    <span className="text-xl font-bold">SyncDraft</span>
                </div>
                <button className="w-full bg-gray-800 text-white py-2 px-4 rounded mb-4">New Document</button>
                <h2 className="text-lg font-semibold mb-2">Most recent:</h2>
                <ul>
                    {documents.map((doc) => (
                        <li
                            key={doc.id} // Assuming each document has a unique id
                            className={`py-2 px-4 rounded mb-2 cursor-pointer ${selectedDocument === doc.id ? 'bg-white' : 'bg-gray-100'}`}
                            onClick={() => setSelectedDocument(doc.id)} // Use doc.id for setting selectedDocument
                        >
                            {doc.title} {/* Assuming each document has a title */}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-3/4 bg-gray-50 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{documentName}</h1> {/* Display the fetched document name */}
                    <div className="flex items-center">
                        <i className="fas fa-user-circle text-2xl mr-2" title="User Profile"></i>
                        <i className="fas fa-users text-2xl mr-2" title="Share with Users"></i>
                        <button className="bg-gray-200 text-gray-800 py-1 px-3 rounded mr-2" title="Share">Share</button>
                        <button className="bg-gray-200 text-gray-800 py-1 px-3 rounded" title="Save" onClick={handleSave}>Save</button>
                    </div>
                </div>
                <div ref={quillRef} className="h-96 bg-white border rounded"></div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
