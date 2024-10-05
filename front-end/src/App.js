import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarkdownEditor from './MarkdownEditor';
import DocumentSharing from './DocumentSharing'
import LoginPage from './Login';
import SignupPage from './SignUp';
import Dashboard from './dashboard';
import ProtectedRoute from './ProtectedRoute';
import DocumentVersionControl from './Versions';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Protect the dashboard route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/versions"
          element={
            <ProtectedRoute>
              <DocumentVersionControl />
            </ProtectedRoute>
          }
        />

        <Route
          path="/versions"
          element={
            <ProtectedRoute>
              <DocumentVersionControl />
            </ProtectedRoute>
          }
        />


        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <MarkdownEditor />
            </ProtectedRoute>
          }
        />



        <Route
          path="/permissions"
          element={
            <ProtectedRoute>
              <DocumentSharing />
            </ProtectedRoute>
          }
        />





      </Routes>
    </Router>
  );
}

export default App;
