import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from './assets/logo.png';
import search from './assets/search.png'
import logout from './assets/logout.png'
import { jwtDecode } from 'jwt-decode';
const baseURL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [userActivity, setUserActivity] = useState({
    documentsCreated: 0,
    documentsShared: 0,
  });
  const [userName, setUserName] = useState('');
  const [requests, setRequests] = useState([
  ]);

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

            // console.log('User ID:', userId);

            // Fetch user details based on the extracted userId
            const response = await axios.get(`${baseURL}/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
              },
            });

            setUserName(response.data.name); // Assuming the API returns a 'name' field in the response
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

  // Fetch recent documents
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Retrieve the JWT token from local storage or your preferred storage
        // console.log('Saved JWT token:', token);
        const response = await axios.get(`${baseURL}/api/documents/recent`, {
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
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`${baseURL}/api/user/activity`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
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
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`${baseURL}/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Assuming the response data is an array of request objects
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);


  // Log requests state after it updates
  useEffect(() => {
    console.log('Current requests:', requests);
  }, [requests]); // Logs requests whenever it updates




  // Handle accept action
  const handleAccept = async (request) => {
    // Optimistically remove the request from the state
    setRequests((prevRequests) => prevRequests.filter((r) => r.id !== request.id));

    try {
      const token = localStorage.getItem('jwtToken');

      // 1. Call API to add permission to the 'permissions' table
      await axios.post(
        `${baseURL}/permissions`, // API endpoint
        {
          permission: {
            user: request.user_id, // Use request's user ID
            document: request.document_id, // Use request's document ID
            access_type: request.permission, // Use the permission from request
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token
          },
        }
      );

      // 2. Call API to delete the request from the 'requests' table
      await axios.delete(`${baseURL}/requests/${request.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // No need to setRequests again since we've already done it optimistically
    } catch (error) {
      console.error('Error processing accept request:', error);

      // If the API call fails, you may want to re-add the request back to state
      setRequests((prevRequests) => [...prevRequests, request]); // Revert optimistic update
    }
  };



  // Handle decline action
  const handleDecline = async (request) => {
    // Optimistically remove the request from the state
    setRequests((prevRequests) => prevRequests.filter((r) => r.id !== request.id));

    try {
      const token = localStorage.getItem('jwtToken');

      // Call API to delete the request from the 'requests' table
      await axios.delete(`${baseURL}/requests/${request.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // No need to setRequests again since we've already done it optimistically
    } catch (error) {
      console.error('Error processing decline request:', error);

      // If the API call fails, you may want to re-add the request back to state
      setRequests((prevRequests) => [...prevRequests, request]); // Revert optimistic update
    }
  };



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
          <div>
            {/* User Name - Clickable to redirect to profile */}
            {userName && (
              <button
                // onClick={() => window.location.href = '/profile'} 
                className="text-gray-800 font-semibold hover:text-blue-600 transition">
                {userName}
              </button>
            )}
          </div>
          {/* <img src={search} alt="Search"  className="bg-yellow-100 rounded-full w-12 h-12"></img> */}
          <div className="bg-blue-100 rounded-full shadow  w-12 h-10" >
            <button className=" text-xl font-semibold text-gray-800" onClick={handleLogout}>
              <img src={logout} alt="Logout" className="bg-yellow-50 rounded-full w-12 h-12"></img>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Action Buttons */}
        <div className="bg-white shadow p-4 flex justify-between items-center mb-6">
          <button className="bg-blue-900 text-white px-4 py-2 rounded flex items-center shadow-md hover:bg-blue-700 transition" onClick={() => window.location.href = '/editor'}>
            <i className="fas fa-plus mr-2"></i> New Document
          </button>
          <img src={search} alt="Search" className="bg-yellow-50 rounded-full w-12 h-12"></img>
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
                        {/* <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                          <span className="text-white font-bold">SD</span>
                        </div> */}
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Access Invitations</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h1 className="font-semibold text-gray-800 text-lg mb-2">{request.document_title}</h1>
                    <p className="text-gray-600 text-sm">
                      You have been invited to access the document <span className="font-semibold">{request.document_title}</span> as a <span className="font-semibold">{request.permission}</span>.
                    </p>
                    <p className="text-gray-500 text-xs">
                      Invitation sent on {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAccept(request)}
                      className="bg-green-500 text-white px-4 py-1 rounded shadow hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(request)}
                      className="bg-red-500 text-white px-4 py-1 rounded shadow hover:bg-red-600"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No invitations available.</p>
            )}
          </div>
        </div>



      </main>
    </div>
  );
};

export default Dashboard;
