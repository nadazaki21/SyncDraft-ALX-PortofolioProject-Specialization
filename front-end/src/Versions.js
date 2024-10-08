import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
const baseURL = process.env.REACT_APP_API_BASE_URL;

const DocumentVersionControl = () => {
    const [documentId, setDocumentId] = useState(localStorage.getItem('selectedDocumentId'));
    const [documentTitle, setDocumentTitle] = useState(localStorage.getItem('selectedDocumentTitle'));
    const [userRole, setUserRole] = useState(localStorage.getItem('UserRole'));
    const [versions, setVersions] = useState([]);
    const [selectedVersionContent, setSelectedVersionContent] = useState(null);
    const [comparisonVersionContent, setComparisonVersionContent] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [comparisonVersion, setComparisonVersion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVersionNumber, setSelectedVersionNumber] = useState('');
    const [comparisonVersionNumber, setComparisonVersionNumber] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('selectedDocumentId');
        const title = localStorage.getItem('selectedDocumentTitle');
        const role = localStorage.getItem('UserRole');

        setDocumentId(id);
        setDocumentTitle(title);
        setUserRole(role);

        if (id) {
            const token = localStorage.getItem('jwtToken');
            setLoading(true);
            axios.get(`${baseURL}/api/documents/${id}/versions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    setVersions(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    setError('Error fetching versions. Please try again.');
                    console.error('Error fetching versions:', error);
                    setLoading(false);
                });
        }
    }, [documentId]);

    const handleRestoreVersion = async (versionId) => {
        try {
            // Assuming you have a documentId available to update the document
            const documentId = localStorage.getItem('selectedDocumentId');
            const token = localStorage.getItem('jwtToken');
            // console.log('Document ID:', documentId);
            // console.log('Version ID:', versionId);

            // Retrieve the selected version's content from versions
            const selectedVersion = versions.find(version => version.id === versionId);
            // console.log('content:', selectedVersion.content);

            if (!selectedVersion) {
                alert('Version not found');
                return;
            }

            // Send PUT request to update the document content with the selected version's raw JSON content
            const response = await axios.put(
                `${baseURL}/api/documents/${documentId}`,
                {
                    content: selectedVersion.content // Send the raw JSON content
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                alert('Document restored to this version successfully!');
                // Optionally update the UI or refetch the document data to reflect the restored content
            } else {
                alert('Failed to restore the document version');
            }
        } catch (error) {
            console.error('Error restoring the document version:', error);
            alert('An error occurred while restoring the document version');
        }
    };

    const handleCompareVersions = (selectedVersionId, comparisonVersionId) => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('jwtToken');

        const selectedVersionRequest = axios.get(`${baseURL}/api/documents/${documentId}/versions/${selectedVersionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const comparisonVersionRequest = axios.get(`${baseURL}/api/documents/${documentId}/versions/${comparisonVersionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        Promise.all([selectedVersionRequest, comparisonVersionRequest])
            .then(([response1, response2]) => {
                const content1 = JSON.parse(response1.data.content);
                const content2 = JSON.parse(response2.data.content);
                setSelectedVersionContent(content1);
                setComparisonVersionContent(content2);
            })
            .catch(error => {
                setError('Error fetching versions for comparison. Please try again.');
                console.error('Error comparing versions:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Convert Delta to HTML
    const getHtmlContent = (delta) => {
        if (!delta) return '';

        const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
        return converter.convert();
    };

    // Utility function to check if a button should be disabled based on user role
    const isDisabled = (role, buttonType) => {
        if (role === "Viewer") {
            // Viewers can't Restore the version
            return ["restore" ].includes(buttonType);
        }
    };
 

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Document Version Control</h1>
                <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => window.location.href = '/editor'}>Back to Editor</button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600">{error}</p>}

            {/* Loading State */}
            {loading ? <p>Loading versions...</p> : (
                <>
                    {/* Version History Section */}
                    <div className="bg-gray-100 p-4 rounded shadow mb-4">
                        {/* Document Name Section */}
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Document Title</label>
                            <h2 className="text-2xl font-bold text-gray-800">{documentTitle}</h2>
                        </div>
                        <h2 className="text-xl font-semibold mb-4">Version History</h2>
                        <div className="mb-4">
                            {versions.map(version => (
                                <div key={version.id} className="flex items-center mb-6">
                                    <div className="flex-1">
                                        <p className="font-semibold">Version {version.version_number}</p>
                                        <p className="text-sm text-gray-600">Edited by {version.editor_name} • {new Date(version.created_at).toLocaleString()}</p>
                                        <p className="text-md font-semibold text-gray-600 mt-2">Description: {version.change_description}</p>
                                    </div>

                                    <button
                                        disabled={isDisabled(userRole, "restore")}
                                        title={isDisabled(userRole, "restore") ? "You don't have permission to restore versions" : "Restore this version"}
                                        onClick={() => handleRestoreVersion(version.id)}
                                        className="bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-500 disabled:bg-gray-300 disabled:opacity-50"
                                        aria-label={`Restore Version ${version.version_number}`}
                                    >
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex mb-4">
                        <select
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                            onChange={(e) => {
                                const selected = versions.find(version => version.id === parseInt(e.target.value));
                                setSelectedVersion(e.target.value); // Set id
                                setSelectedVersionNumber(selected ? selected.version_number : ''); // Set version number for display
                            }}
                        >
                            <option value="">Select version</option>
                            {versions.map(version => (
                                <option key={version.id} value={version.id}>
                                    Version {version.version_number}
                                </option>
                            ))}
                        </select>
                        <select
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            onChange={(e) => {
                                const selected = versions.find(version => version.id === parseInt(e.target.value));
                                setComparisonVersion(e.target.value); // Set id
                                setComparisonVersionNumber(selected ? selected.version_number : ''); // Set version number for display
                            }}
                        >
                            <option value="">Select version to compare</option>
                            {versions.map(version => (
                                <option key={version.id} value={version.id}>
                                    Version {version.version_number}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleCompareVersions(selectedVersion, comparisonVersion)}
                            className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600"
                        >
                            Compare
                        </button>
                    </div>

                    {/* Document Content Display Section */}
                    <div className="bg-gray-100 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Document Content</h2>
                        <div className="flex space-x-4">
                            {/* Box 1 for Selected Version Content */}
                            <div className="w-1/2 bg-gray-200 p-4 rounded">
                                <h4 className="font-bold text-lg">
                                    Selected Version ({selectedVersionNumber || 'None'}) {/* Display version number */}
                                </h4>
                                <div
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: getHtmlContent(selectedVersionContent) }}
                                />
                            </div>

                            {/* Box 2 for Comparison Version Content */}
                            <div className="w-1/2 bg-gray-300 p-4 rounded">
                                <h4 className="font-bold text-lg">
                                    Comparison Version ({comparisonVersionNumber || 'None'}) {/* Display version number */}
                                </h4>
                                <div
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: getHtmlContent(comparisonVersionContent) }}
                                />
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div >
    );
};
export default DocumentVersionControl;
