import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you're using axios for API requests
const baseURL = process.env.REACT_APP_API_BASE_URL;

const DocumentVersionControl = () => {
    const [documentId, setDocumentId] = useState(localStorage.getItem('selectedDocumentId'));
    const [documentTitle, setDocumentTitle] = useState(localStorage.getItem('selectedDocumentTitle'));
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [comparisonVersion, setComparisonVersion] = useState(null);
    const [diffs, setDiffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('selectedDocumentId');
        const title = localStorage.getItem('selectedDocumentTitle');

        setDocumentId(id);
        setDocumentTitle(title);

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

    const handleViewVersion = (versionId) => {
        const token = localStorage.getItem('jwtToken');
        axios.get(`${baseURL}/api/documents/${documentId}/versions/${versionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(response => setSelectedVersion(response.data))
        .catch(error => {
            setError('Error fetching version. Please try again.');
            console.error('Error fetching version:', error);
        });
    };

    const handleRestoreVersion = (versionId) => {
        const token = localStorage.getItem('jwtToken');
        axios.post(`${baseURL}/api/documents/${documentId}/versions/${versionId}/restore`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(() => {
            alert('Version restored successfully');
            return axios.get(`${baseURL}/api/documents/${documentId}/versions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        })
        .then(response => setVersions(response.data))
        .catch(error => {
            setError('Error restoring version. Please try again.');
            console.error('Error restoring version:', error);
        });
    };

    const handleCompareVersions = (version1Id, version2Id) => {
        if (!version1Id || !version2Id) {
            setError('Please select both versions to compare.');
            return;
        }

        const token = localStorage.getItem('jwtToken');
        axios.get(`${baseURL}/api/documents/${documentId}/compare?version1=${version1Id}&version2=${version2Id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(response => setDiffs(response.data.diffs))
        .catch(error => {
            setError('Error comparing versions. Please try again.');
            console.error('Error comparing versions:', error);
        });
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
                                <div key={version.id} className="flex items-center mb-2">
                                    <img src="https://placehold.co/40" alt="User avatar" className="w-10 h-10 rounded-full mr-4"/>
                                    <div className="flex-1">
                                        <p className="font-semibold">Version {version.version_number}</p>
                                        <p className="text-sm text-gray-600">Edited by {version.editor_name} • {new Date(version.created_at).toLocaleString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleViewVersion(version.id)} 
                                        className="bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                                        aria-label={`View Version ${version.version_number}`}
                                    >
                                        View
                                    </button>
                                    <button 
                                        onClick={() => handleRestoreVersion(version.id)} 
                                        className="bg-gray-400 text-gray-800 px-4 py-2 rounded"
                                        aria-label={`Restore Version ${version.version_number}`}
                                    >
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Version Comparison Section */}
                    <div className="bg-gray-100 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Version Comparison</h2>
                        <div className="flex mb-4">
                            <select 
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2" 
                                onChange={(e) => setSelectedVersion(e.target.value)}
                            >
                                <option value="">Select version</option>
                                {versions.map(version => (
                                    <option key={version.id} value={version.id}>Version {version.version_number}</option>
                                ))}
                            </select>
                            <select 
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                onChange={(e) => setComparisonVersion(e.target.value)}
                            >
                                <option value="">Select version to compare</option>
                                {versions.map(version => (
                                    <option key={version.id} value={version.id}>Version {version.version_number}</option>
                                ))}
                            </select>
                            <button 
                                onClick={() => handleCompareVersions(selectedVersion, comparisonVersion)} 
                                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                            >
                                Compare
                            </button>
                        </div>
                        <div className="bg-gray-100 p-4 rounded">
                            {diffs.map((diff, index) => (
                                <p key={index} className={diff.type === 'added' ? 'text-green-600' : diff.type === 'removed' ? 'text-red-600' : diff.type === 'changed' ? 'text-yellow-600' : 'text-gray-800'}>
                                    {diff.content}
                                </p>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DocumentVersionControl;
