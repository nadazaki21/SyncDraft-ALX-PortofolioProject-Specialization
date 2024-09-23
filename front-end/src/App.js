import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarkdownEditor from './MarkdownEditor';
import DocumentSharing from './DocumentSharing'
import LoginPage from './Login';
import SignupPage from './SignUp';
import Dashboard from './dashboard';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    // <SignupPage/>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Protect the dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        /> */}



      </Routes>
    </Router>
  );
}

export default App;
