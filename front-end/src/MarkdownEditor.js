import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill's styles
import Quill from 'quill';
import logo from './assets/logo.png';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const MarkdownEditor = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState([]); // State for documents
    const [documentName, setDocumentName] = useState('Untitled Document'); // State for document name
    const [isNewDocument, setIsNewDocument] = useState(true); // State for new document creation
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
                const token = localStorage.getItem('jwtToken'); // Retrieve the JWT token from local storage
                const response = await axios.get(`${baseURL}/api/documents`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
                    },
                });
    
                setDocuments(response.data || []); // Assuming the response data is an array of documents
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        const fetchDocumentName = async () => {
            if (selectedDocument !== null && !isNewDocument) {
                try {
                    const token = localStorage.getItem('jwtToken');
                    const response = await axios.get(`${baseURL}/api/documents/${selectedDocument}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
    
                    setDocumentName(response.data.title);
    
                    const content = JSON.parse(response.data.content); // Parse if it's a string
                    quillInstance.current.setContents(content); // Set the Delta content directly
                } catch (error) {
                    console.error('Error fetching document:', error);
                }
            }
        };
    
        fetchDocumentName();
    }, [selectedDocument, isNewDocument]);

    const handleSave = async () => {
        const delta = quillInstance.current.getContents(); // Get delta JSON
        const contentJson = JSON.stringify(delta); // Convert to JSON string
        // Prevent saving empty document
        if (delta.length() === 1 && delta.ops[0].insert.trim() === "") {
            alert("Document cannot be empty.");
            return;
        }
        console.log('Saving document...');
    
        try {
            const token = localStorage.getItem('jwtToken'); // Retrieve the JWT token from local storage
    
            if (isNewDocument) {
                // Make a POST request to create a new document
                const response = await axios.post(`${baseURL}/api/documents`, {
                    title: documentName, // Use the document name
                    content: contentJson, // Initial content is empty
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // JWT token
                    },
                });

                // Set the selected document to the new document ID
                setSelectedDocument(response.data.id);
                setIsNewDocument(false); // Mark it as not a new document anymore
                setDocuments([...documents, response.data]);
            } else {
                // Make a PUT request to update the existing document
                const response = await axios.put(`${baseURL}/api/documents/${selectedDocument}`, {
                    title: documentName, // Use the updated document name
                    content: contentJson, // Updated content
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // JWT token
                    },
                });
                console.log('Updated document:', response.data);
                // Update the document in the state (find and replace the document)
            setDocuments(documents.map((doc) =>
                doc.id === selectedDocument ? response.data : doc
            ));
        
            }
            console.log('Document saved successfully');
            
        } catch (error) {
            console.error('Error saving document:', error.response ? error.response.data : error.message);
            alert('Failed to save document. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                const token = localStorage.getItem('jwtToken');
                await axios.delete(`${baseURL}/api/documents/${selectedDocument}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDocuments(documents.filter(doc => doc.id !== selectedDocument));
                setSelectedDocument(null);
                setIsNewDocument(true); // Mark it as a new document
                quillInstance.current.setContents(''); // Clear the editor
                alert('Document deleted successfully.');
            } catch (error) {
                console.error('Error deleting document:', error);
                alert('Failed to delete document. Please try again.');
            }
        }
    };

    const handleNewDocument = () => {
        setDocumentName('Untitled Document'); // Reset to default title
        quillInstance.current.setContents(''); // Clear the editor content
        setSelectedDocument(null); // No selected document yet
        setIsNewDocument(true); // Mark it as a new document
        // handleSave();
    };
    

    
    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-100 p-4">
                <div className="flex items-center mb-6">
                    <img src={logo} alt="SyncDraft Logo" className="w-4 h-4 bg-gray-400 rounded-full mr-2"></img>
                    <span className="text-xl font-bold">SyncDraft</span>
                </div>
                <button className="w-full bg-gray-800 text-white py-2 px-4 rounded mb-4" onClick={handleNewDocument}>New Document</button>
                <h2 className="text-lg font-semibold mb-2">Most recent:</h2>
                <ul>
                    {documents.map((doc) => (
                        <li
                            key={doc.id}
                            className={`py-2 px-4 rounded mb-2 cursor-pointer ${selectedDocument === doc.id ? 'bg-white' : 'bg-gray-100'}`}
                            onClick={() => {
                                setSelectedDocument(doc.id);
                                setIsNewDocument(false);
                            }}
                        >
                            {doc.title}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-3/4 bg-gray-50 p-6">
                <div className="flex justify-between items-center mb-4">
                <input
                        className="text-2xl font-bold border-b focus:outline-none"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)} // Make the title editable
                    />
                    <div className="flex items-center">
                        <i className="fas fa-user-circle text-2xl mr-2" title="User Profile"></i>
                        <i className="fas fa-users text-2xl mr-2" title="Share with Users"></i>
                        <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded mr-2" title="Share">Share</button>
                        <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded mr-6" title="Save" onClick={handleSave}>Save</button>
                        <button className="bg-red-500 text-white py-1 px-3 rounded" title="Delete" onClick={handleDelete} disabled={!selectedDocument}>Delete</button>
                    </div>
                </div>
                <div ref={quillRef} className="h-96 bg-white border rounded"></div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
