import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from './assets/logo.png';
import search from './assets/search.png'
import logout from './assets/logout.png'


const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [userActivity, setUserActivity] = useState({
    documentsCreated: 0,
    documentsShared: 0,
  });
  const [requests, setRequests] = useState([
    // fake hardcoded data for testin how would requests look 
    {
      id: 1,
      document_title: 'Project Plan',
      requester_name: 'John Doe',
      permission_type: 'Editor',
      created_at: '2024-09-23T10:20:30Z',
    },
    {
      id: 2,
      document_title: 'Budget Report',
      requester_name: 'Jane Smith',
      permission_type: 'Viewer',
      created_at: '2024-09-22T08:15:45Z',
    }
  ]);


  // Fetch recent documents
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Retrieve the JWT token from local storage or your preferred storage
        console.log('Saved JWT token:', token);
        const response = await axios.get('http://localhost:3000/api/documents/', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
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

  // fetch user current requests 
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('END_POINT_PLACEHOLDR');  // Adjust the API endpoint based on your backend
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
  
    fetchRequests();
  }, []);
  


  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Remove the JWT token
    window.location.href = '/login';  // Redirect to the login page
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="SyncDraft Logo" className="bg-blue-500 rounded-full w-10 h-10"></img>
          <h1 className="ml-2 text-2xl font-bold text-gray-800">SyncDraft</h1>
        </div>
        <div className="flex items-center space-x-4">
          <i className="fas fa-search text-gray-600"></i>
          <i className="fas fa-bell text-gray-600"></i>
          {/* <img src={search} alt="Search"  className="bg-yellow-100 rounded-full w-12 h-12"></img> */}
          <div className="bg-blue-100 rounded-full shadow  w-12 h-10" >
            <button  className=" text-xl font-semibold text-gray-800"  onClick={handleLogout}>
            <img src={logout} alt="Logout"  className="bg-yellow-50 rounded-full w-12 h-12"></img>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Action Buttons */}
        <div className="bg-white shadow p-4 flex justify-between items-center mb-6">
          <button className="bg-blue-900 text-white px-4 py-2 rounded flex items-center shadow-md hover:bg-blue-700 transition">
            <i className="fas fa-plus mr-2"></i> New Document
          </button>
          <img src={search} alt="Search"  className="bg-yellow-50 rounded-full w-12 h-12"></img>
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
                          <span className="text-white font-bold">SD</span>
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

        {/* Requests Section */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Requests</h2>
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.document_title}</h3>
                    <p className="text-gray-600 text-sm">
                      Request from <span className="font-semibold">{request.requester_name}</span> 
                      to access as <span className="font-semibold">{request.permission_type}</span>
                    </p>
                    <p className="text-gray-500 text-xs">
                      Requested on {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-500 text-white px-4 py-1 rounded shadow hover:bg-green-600">
                      Accept
                    </button>
                    <button className="bg-red-500 text-white px-4 py-1 rounded shadow hover:bg-red-600">
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No requests available.</p>
            )}
          </div>
        </div>


      </main>
    </div>
  );
};

export default Dashboard;
