import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill's styles
import Quill from 'quill';
import logo from './assets/logo.png';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom'; 
import { createConsumer } from "@rails/actioncable";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const MarkdownEditor = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState([]); // State for documents
    const [documentName, setDocumentName] = useState('Untitled Document'); // State for document name
    const [isNewDocument, setIsNewDocument] = useState(true); // State for new document creation
    const quillRef = useRef(null); // Reference for the Quill editor
    const quillInstance = useRef(null); // Reference to store the Quill instance
    const [currentUser, setCurrentUser] = useState(null);
    const [documentRoles, setDocumentRoles] = useState({}); // Store roles for each document
    const location = useLocation(); // Use useLocation to access the current URL
    const queryParams = new URLSearchParams(location.search);
    const documentIdFromQuery = queryParams.get('id'); // Extract the document ID from the query string
    const isMounted = useRef(true); 
    const subscriptionRef = useRef(null); 

    useEffect(() => {
        // Initialize Quill editor only if it hasn't been initialized yet
        if (!quillInstance.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container:[
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

    // Utility function to check if a button should be disabled based on user role
    const isDisabled = (role, buttonType) => {
        if (role === "Viewer") {
            // Viewers can't share, save, create new version, or delete
            return ["share", "save", "create", "createVersion", "delete"].includes(buttonType);
        } else if (role === "Editor") {
            // Editors can't share or delete
            return ["share", "delete"].includes(buttonType);
        }
        // Creators can do everything
        return false;
    };

    useEffect(() => {
        // Fetch recent documents when the component mounts
        const fetchDocumentsAndRoles = async () => {
            try {
                const token = localStorage.getItem('jwtToken'); // Retrieve the JWT token from local storage

                // Fetch all documents
                const response = await axios.get(`${baseURL}/api/documents`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
                    },
                });

                const documents = response.data || []; // Assuming the response data is an array of documents
                setDocuments(documents); // Set documents state

                // Fetch roles for each document
                const roles = {};
                for (const doc of documents) {
                    let role = '';

                    // Check if the user is the creator
                    if (doc.created_by_id === currentUser) {
                        role = 'Creator';
                    } else {
                        // Fetch permissions for the current user and document
                        const permissionResponse = await axios.get(`${baseURL}/permissions/${doc.id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
                            },
                        });

                        const userPermission = permissionResponse.data.find(p => p.user_id === currentUser);

                        if (userPermission) {
                            if (userPermission.access_type === 'viewer') {
                                role = 'Viewer';
                            } else if (userPermission.access_type === 'editor') {
                                role = 'Editor';
                            }
                        } else {
                            role = 'No Role';
                        }
                    }

                    // Store role for the document
                    roles[doc.id] = role;
                }

                // Update state with document roles
                setDocumentRoles(roles);

            } catch (error) {
                console.error('Error fetching documents or permissions:', error);
            }
        };

        fetchDocumentsAndRoles(); // Call the function when the component mounts
    }, [currentUser]); // Ensure currentUser is available in the dependency array

    useEffect(() => {
        // Decode the JWT token once when the component mounts
        const token = localStorage.getItem('jwtToken');
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken.user_id); // Set the current user based on the decoded token
            console.log('User ID:', decodedToken.user_id);
        }
    }, []); // Only runs once when the component mounts


    useEffect(() => {
        // If there is a document ID in the query, update selectedDocument
        if (documentIdFromQuery) {
            setSelectedDocument(documentIdFromQuery);
            setIsNewDocument(false);
        }
    }, [documentIdFromQuery]);

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
    }, [selectedDocument, isNewDocument, documentIdFromQuery]);

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

    const handleShare = () => {
        localStorage.setItem('selectedDocumentId', selectedDocument);

        console.log("Set the current document ID to: ", selectedDocument);

        // Delay navigation to ensure the localStorage update completes
        setTimeout(() => {
            window.location.href = '/permissions';
        }, 100); // 100ms delay should be sufficient
    };

    const getNextVersionNumber = async (selectedDocument) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get(`${baseURL}/api/documents/${selectedDocument}/versions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const versions = response.data;

            if (versions.length === 0) {
                return 1; // No versions exist, start from 1
            }

            // Find the highest version number
            const maxVersionNumber = Math.max(...versions.map(version => version.version_number));
            return maxVersionNumber + 1; // Increment by 1 for the new version
        } catch (error) {
            console.error('Error fetching document versions:', error);
            throw error; // Re-throw the error for further handling
        }
    };


    const handleCreateNewVersion = async (documentId) => {
        // Prompt the user for a description
        const description = window.prompt("Enter a description for the new version:");
        const token = localStorage.getItem('jwtToken');
        const nextVersionNumber = await getNextVersionNumber(documentId);
        const deltaContent = quillInstance.current.getContents(); // Get delta JSON
        if (deltaContent.ops.length === 0 || (deltaContent.ops.length === 1 && deltaContent.ops[0].insert.trim() === "")) {
            alert("Document cannot be empty.");
            return;
        }
        const jsonContent = JSON.stringify(deltaContent); // Convert to JSON string
        // console.log("Document ID:", documentId);
        // console.log("Content:", jsonContent);
        // console.log("Version number:", nextVersionNumber);
        if (description) {
            try {
                // Make a POST request to create a new version with Authorization header
                const response = await axios.post(
                    `${baseURL}/api/documents/${documentId}/versions`,
                    {
                        document_id: documentId,
                        content: jsonContent,
                        version_number: nextVersionNumber,
                        change_description: description,
                        // Include any other necessary fields
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`, // Add Authorization header
                        },
                    }
                );
                // Handle success (e.g., display success message, update UI)
                // console.log("Document ID:", documentId);
                // console.log("Content:", jsonContent);
                // console.log("Version number:", nextVersionNumber);
                console.log("New version created:", response.data);
                alert("New version created successfully!");

                // Optionally, refresh or update the version list here

            } catch (error) {
                console.error("Error creating new version:", error);
                alert("Failed to create a new version. Please try again.");
            }
        }
        else {
            alert("Please enter a description for the new version.");
        }
    };

    const handleDocunetVersions = () => {
        localStorage.setItem('selectedDocumentId', selectedDocument);
        localStorage.setItem('selectedDocumentTitle', documentName);

        console.log("Set the current document ID to: ", documentName);

        // Delay navigation to ensure the localStorage update completes
        setTimeout(() => {
            window.location.href = '/versions';
        }, 100); // 100ms delay should be sufficient
    };



    // for websocket
    useEffect(() => {
        const cable = createConsumer('ws://localhost:3000/cable');
        const subscription = cable.subscriptions.create(
          { channel: `document_${selectedDocument}`, document_id: selectedDocument },
          {
            received(data) {
              console.log("Received data: ", data);
              quillInstance.current.setContents(data.changes); // Assuming quillInstance is a ref for your Quill editor
            },
          }
        );
    
        // Store the subscription in the ref so it can be accessed later
        subscriptionRef.current = subscription;
    
        // Cleanup function
        return () => {
          if (isMounted.current) {
            // Save to Redis or perform other actions before unsubscribing
            //saveToRedis(content); // Replace with your saving logic
          }
          subscription.unsubscribe(); // Unsubscribe from the WebSocket channel
        };
      }, [selectedDocument]);

    useEffect(() => {
        // Set isMounted to true when the component mounts
        isMounted.current = true;

        return () => {
            // Set isMounted to false when the component unmounts
            isMounted.current = false;
        };
    }, []);

    // Function to handle document updates (e.g., on typing)
    const handleChange = () => {
        // Use the stored subscription from the ref to perform the update action
        if (subscriptionRef.current) {
          subscriptionRef.current.perform('update', { document_id: selectedDocument, changes: quillInstance.current.getContents() });
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-100 p-4">
                <button onClick={() => window.location.href = '/'}>
                    <div className="flex items-center mb-6">
                        <img src={logo} alt="SyncDraft Logo" className="w-5 h-5 bg-gray-400 rounded-full mr-2"></img>
                        <span className="text-xl font-bold">SyncDraft</span>
                    </div>
                </button>
                <button className="w-full bg-gray-800 text-white py-2 px-4 rounded mb-4" onClick={handleNewDocument}>New Document</button>
                <h2 className="text-lg font-semibold mb-2">All Documents:</h2>
                <ul>
                    {documents.map((doc) => (
                        <li
                            key={doc.id}
                            className={`py-4 px-6 rounded mb-4 cursor-pointer flex items-center justify-between transition-colors duration-300 ${selectedDocument === doc.id ? 'bg-white shadow-md' : 'bg-gray-100'}`}
                            onClick={() => {
                                setSelectedDocument(doc.id);
                                setIsNewDocument(false);
                            }}
                        >
                            {/* Document title */}
                            <span className="text-lg font-semibold text-gray-800">
                                {doc.title}
                            </span>

                            {/* User role */}
                            <span className="text-sm font-medium text-gray-500 ml-6">
                                {documentRoles[doc.id] || 'Loading...'}
                            </span>
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
                        {/* Share Button */}
                        <button
                            className="btn share-btn bg-gray-200 text-gray-800 py-2 px-4 rounded mr-2 disabled:opacity-50 hover:bg-gray-300"
                            disabled={isDisabled(documentRoles[selectedDocument], "share")}
                            title={isDisabled(documentRoles[selectedDocument], "share") ? "You don't have permission to share" : ""}
                            onClick={() => handleShare(selectedDocument)}
                        >
                            Share
                        </button>
                        {/* Save Button */}
                        <button
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded mr-8 disabled:opacity-50 hover:bg-gray-300"
                            title={isDisabled(documentRoles[selectedDocument], "save") ? "You don't have permission to save" : ""}
                            onClick={handleSave}
                            disabled={isDisabled(documentRoles[selectedDocument], "save")}
                        >
                            Save
                        </button>
                        {/* Create New Version Button */}
                        <button
                            className="bg-blue-500 text-white hover:bg-blue-600 py-2 px-3 rounded mr-2 disabled:opacity-50"
                            title={isDisabled(documentRoles[selectedDocument], "createVersion") ? "You don't have permission to create a new version" : ""}
                            onClick={() => handleCreateNewVersion(selectedDocument)}
                            disabled={isDisabled(documentRoles[selectedDocument], "createVersion")}
                        >
                            Create New Version
                        </button>
                        {/* Document Versions Button */}
                        <button
                            className="bg-blue-500 text-white hover:bg-blue-600 py-2 px-3 rounded mr-8"
                            title="Document Versions"
                            onClick={() => handleDocunetVersions()}
                        >
                            Document Versions
                        </button>
                        {/* Delete Button */}
                        <button
                            className="bg-red-500 text-white py-1 px-3 rounded disabled:opacity-50 hover:bg-red-600"
                            title={isDisabled(documentRoles[selectedDocument], "delete") ? "You don't have permission to delete" : ""}
                            onClick={handleDelete}
                            disabled={isDisabled(documentRoles[selectedDocument], "delete")}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <div ref={quillRef} className="h-96 bg-white border rounded"
                    style={{ cursor: documentRoles[selectedDocument] === 'Viewer' ? 'not-allowed' : 'auto' }}
                >
                    <textarea
                        //value={quillRef} // Bind content state to the textarea
                        onChange={(e) => handleChange(e.target.value)} // Handle change
                        className="w-full h-full border border-gray-300 rounded p-2"
                        placeholder="Edit your document here..."
                    />

                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
