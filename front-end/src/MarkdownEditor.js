import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill's styles
import Quill from 'quill';
import logo from './assets/logo.png';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';
import { createConsumer } from "@rails/actioncable";
import QuillCursors from 'quill-cursors';
import './custom-cursor.css';


const baseURL = process.env.REACT_APP_API_BASE_URL;
Quill.register('modules/cursors', QuillCursors);



const MarkdownEditor = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState([]); // State for documents
    const [documentName, setDocumentName] = useState('Untitled Document'); // State for document name
    const [isNewDocument, setIsNewDocument] = useState(true); // State for new document creation

    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserName, setCurrentUserName] = useState(null);
    const [documentRoles, setDocumentRoles] = useState({}); // Store roles for each document
    const location = useLocation(); // Use useLocation to access the current URL
    const queryParams = new URLSearchParams(location.search);
    const documentIdFromQuery = queryParams.get('id'); // Extract the document ID from the query string
    const isMounted = useRef(true);
    const subscriptionRef = useRef(null);
    // Get the cursors module once and store it in a ref
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
                    cursors: true,
                },

            });

        }
    }, [selectedDocument, documentRoles]);
    useEffect(() => {
        // Set the Quill editor to read-only if the user is a Viewer
        const currentRole = documentRoles[selectedDocument]; // Get the user's role for the selected document
        console.log(currentRole);
        if (currentRole === 'Viewer') {
            quillInstance.current.enable(false); // Disable the editor (read-only mode)
        } else {
            quillInstance.current.enable(true); // Enable the editor for Editors or Creators
        }
    })


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


    // Fetch recent documents when the component mounts
    const fetchDocumentsAndRoles = useCallback(async () => {
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
                        role = 'Creator';
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
    }, [currentUser]);


    useEffect(() => {
        fetchDocumentsAndRoles(); // Call the function when the component mounts
    }, [fetchDocumentsAndRoles]); // Only include currentUser in the dependency array

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                if (token) {
                    try {
                        // Decode the JWT token
                        const decodedToken = jwtDecode(token); // Ensure the import matches
                        // Extract the user ID from the token payload
                        const userId = decodedToken.user_id;
                        setCurrentUser(decodedToken.user_id);

                        // console.log('User ID:', userId);

                        // Fetch user details based on the extracted userId
                        const response = await axios.get(`${baseURL}/users/${userId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
                            },
                        });

                        setCurrentUserName(response.data.name); // Assuming the API returns a 'name' field in the response
                        // console.log('User name:', response.data.name);
                    } catch (error) {
                        console.error('Error decoding token:', error);
                    }
                }
            } catch (error) {
                console.error('Error fetching user name:', error);
            }
        };

        fetchUserId();
    }, []);


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
                    console.log(response.data);
                    setDocumentName(response.data.title);
                    if (response.data.source === 'postgresql') {
                        const content = JSON.parse(response.data.content); // Parse if it's a string
                        quillInstance.current.setContents(content); // Set the Delta content directly
                    }
                    else {
                        const responsed = (response.data.content).replace(/=>/g, ":");
                        quillInstance.current.setContents(JSON.parse(responsed));
                        // console.log(`Document fetched from: ${response.data.source}`); // Debug message
                    }


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
                fetchDocumentsAndRoles();

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
        localStorage.setItem('UserRole', documentRoles[selectedDocument]);


        console.log("Set the current document ID to: ", documentName);

        // Delay navigation to ensure the localStorage update completes
        setTimeout(() => {
            window.location.href = '/versions';
        }, 100); // 100ms delay should be sufficient
    };

    // A throttle function that limits the execution of the function
    // to only once every specified time period (e.g., 100ms).
    const throttle = (func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    };

    const throttledUpdate = useMemo(() => throttle(() => {
        if (subscriptionRef.current) {
            subscriptionRef.current.perform('update', {
                document_id: selectedDocument,
                changes: quillInstance.current.getContents(),
            });
            console.log('ID sent:', selectedDocument);
            console.log('Content sent:', quillInstance.current.getContents());
        }
    }, 50), [selectedDocument]);

    useEffect(() => {
        const quill = quillInstance.current;
        if (quill) {
            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') { // Avoid updates triggered by incoming data
                    const content = quill.getContents();
                    throttledUpdate(content);
                }
            });
        }
        isMounted.current = true;
        return () => {
            if (quill) {
                quill.off('text-change');
            }
            isMounted.current = false;
        };
    }, [throttledUpdate]);

    // For managing cursor position
    const saveCursorPosition = () => {
        const quill = quillInstance.current;
        const range = quill.getSelection();
        return range ? range.index : 0; // Return cursor index or 0 if no selection
    };

    const restoreCursorPosition = (index) => {
        const quill = quillInstance.current;
        quill.setSelection(index);
    };

    // For WebSocket
    useEffect(() => {
        const cable = createConsumer('ws://localhost:3000/cable');
        const subscription = cable.subscriptions.create(
            {
                channel: "DocumentChannel", document_id: selectedDocument,
                user_id: currentUser, user_name: currentUserName,
            },
            {
                received(data) {
                    if (data) {
                        // console.log('Data received:', data);
                        // console.log("Data type:", data.type);
                        try {
                            if (data.type === 'update') {
                                // Handle document content changes
                                const content = data.changes;
                                const currentContents = quillInstance.current.getContents();
                                if (JSON.stringify(currentContents) !== JSON.stringify(content)) {
                                    const currentPosition = saveCursorPosition();
                                    quillInstance.current.setContents(content);
                                    restoreCursorPosition(currentPosition + 1);
                                }
                            } else if (data.type === 'cursor_update') {
                                const cursors = quillInstance.current.getModule('cursors');
                                if (data.user_id !== currentUser) { // Only apply other users' cursor updates
                                    cursors.createCursor(data.user_id, data.user_name, data.cursor_color);
                                    cursors.moveCursor(data.user_id, { index: data.cursor_position, length: data.cursor_length });
                                    console.log("Cursor updated for:", data.user_name, "at position:", data.cursor_position, "with length:", data.cursor_length);
                                }
                            }
                            else if (data.type === 'user_disconnected') {
                                // Remove cursor of disconnected user
                                const cursors = quillInstance.current.getModule('cursors');
                                cursors.removeCursor(data.user_id);
                                console.log(`User ${data.user_name} disconnected, cursor removed.`);
                            }
                        } catch (error) {
                            console.error("Error parsing data:", error);
                        }
                    }
                },
            }
        );

        subscriptionRef.current = subscription;

        // Cleanup function
        return () => {
            if (isMounted.current) {
                // Perform any saving logic before unsubscribing
            }
            subscription.unsubscribe(); // Unsubscribe from the WebSocket channel
        };
    }, [selectedDocument, currentUser, currentUserName]);


    // Attach listener for selection changes
    useEffect(() => {
        const quill = quillInstance.current;
        if (quill) {
            quill.on('selection-change', function (range, oldRange, source) {
                if (source === 'user')
                    if (range) {
                        const cursorPosition = range.index;
                        const cursorLength = range.length;
                        const userName = currentUserName;
                        const userColor = getRandomColor();

                        // Throttle the cursor update to avoid excessive WebSocket messages
                        if (subscriptionRef.current) {
                            if (documentRoles[selectedDocument] !== 'Viewer') {
                            subscriptionRef.current.perform('cursor_update', {
                                document_id: selectedDocument,
                                user_id: currentUser,
                                user_name: userName,
                                cursor_position: cursorPosition,
                                cursor_length: cursorLength,
                                cursor_color: userColor
                            });
                            console.log("Sending cursor update: ", userName, cursorPosition, userColor, currentUser, cursorLength);
                        }
                    }

                    }
                    else {
                        // User has deselected or moved the cursor to an empty space
                        console.log('Cursor is not in a valid range (i.e., no selection).');
                    }


            });
        }

        return () => {
            if (quill) {
                quill.off('selection-change');
            }
        };
    }, [currentUserName, currentUser, selectedDocument, documentRoles]);

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
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
                            className="btn share-btn bg-gray-200 text-gray-800 py-2 px-4 rounded mr-2 disabled:opacity-50 disabled:bg-gray-300 hover:bg-gray-300"
                            disabled={isDisabled(documentRoles[selectedDocument], "share")}
                            title={isDisabled(documentRoles[selectedDocument], "share") ? "You don't have permission to share" : ""}
                            onClick={() => handleShare(selectedDocument)}
                        >
                            Share
                        </button>
                        {/* Save Button */}
                        <button
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded mr-8 disabled:opacity-50 disabled:bg-gray-300 hover:bg-gray-300"
                            title={isDisabled(documentRoles[selectedDocument], "save") ? "You don't have permission to save" : ""}
                            onClick={handleSave}
                            disabled={isDisabled(documentRoles[selectedDocument], "save")}
                        >
                            Save
                        </button>
                        {/* Create New Version Button */}
                        <button
                            className="bg-blue-500 text-white hover:bg-blue-600 py-2 px-3 rounded mr-2 disabled:opacity-50 disabled:bg-blue-300"
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
                            className="bg-red-500 text-white py-1 px-3 rounded disabled:opacity-50 hover:bg-red-600 disabled:bg-red-300"
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
                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;