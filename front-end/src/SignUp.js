import React, { useState } from 'react';
import logo from './assets/logo.png'; // Same logo used in previous pages

const SignupPage = () => {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignup = async () => {
        setError(null);
        // Add signup logic here with API call
        try {
            const response = await fetch('YOUR_SIGNUP_API_ENDPOINT_HERE', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, email, password }),
            });

            if (!response.ok) {
                throw new Error('Signup failed');
            }

            // Handle successful signup
            const result = await response.json();
            console.log('Signup successful:', result);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 relative">
            {/* Background Container */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Add your abstract shapes and textures here */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 left-32 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            </div>

            {/* Signup Form */}
            <div className="w-full max-w-md bg-white p-8 rounded shadow-lg z-10">
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="SyncDraft Logo" className="w-12 h-12 bg-gray-400 rounded-full mb-4" />
                    <h1 className="text-2xl font-bold">Create your SyncDraft account</h1>
                    <p className="text-gray-600">Sign up to get started</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">First Name</label>
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg bg-gray-100"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded-lg bg-gray-100"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        className="w-full p-3 border rounded-lg bg-gray-100"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition"
                    onClick={handleSignup}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default SignupPage;
