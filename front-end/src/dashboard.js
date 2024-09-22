import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [userActivity, setUserActivity] = useState({
    documentsCreated: 0,
    documentsShared: 0,
  });

  // Fetch recent documents
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const response = await axios.get('/api/documents/recent');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching recent documents:', error);
      }
    };

    fetchRecentDocuments();
  }, []);

  // Fetch user activity
  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const response = await axios.get('/api/user/activity');
        setUserActivity({
          documentsCreated: response.data.documents_created,
          documentsShared: response.data.documents_shared,
        });
      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    };

    fetchUserActivity();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-blue-500 rounded-full w-10 h-10"></div>
          <h1 className="ml-2 text-2xl font-bold text-gray-800">SyncDraft</h1>
        </div>
        <div className="flex items-center space-x-4">
          <i className="fas fa-search text-gray-600"></i>
          <i className="fas fa-bell text-gray-600"></i>
          <div className="bg-blue-500 rounded-full w-8 h-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center shadow-md hover:bg-blue-700 transition">
            <i className="fas fa-plus mr-2"></i> New Document
          </button>
        </div>

        {/* Recent Documents & User Activity */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Documents */}
          <div className="col-span-2">
            <div className="bg-white p-6 rounded shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Documents</h2>
              </div>
              <div className="space-y-4">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center">
                        <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                          <span className="text-white font-bold">MD</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                          <p className="text-gray-600 text-sm">
                            Last edited {new Date(doc.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <i className="fas fa-ellipsis-h text-gray-600"></i>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No recent documents available.</p>
                )}
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div>
            <div className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">User Activity</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents Created</span>
                  <span className="font-semibold text-gray-800">{userActivity.documentsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shared Documents</span>
                  <span className="font-semibold text-gray-800">{userActivity.documentsShared}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
