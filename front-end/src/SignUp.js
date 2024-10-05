import React, { useState } from 'react';
import logo from './assets/logo.png'; // Same logo used in previous pages
import './AbstractBackground.css'; // Import the background styles
const baseURL = process.env.REACT_APP_API_BASE_URL;

const SignupPage = () => {
    const [Name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignup = async () => {
        setError(null);

        try {
            // First API call: Create the user
            const createUserResponse = await fetch(`${baseURL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        name: Name,
                        email: email,
                        password: password,
                    },
                }),
            });


            if (!createUserResponse.ok) {
                throw new Error('Failed to create an account');
            }

            // If user creation is successful, proceed to login
            const user = await createUserResponse.json();
            console.log('User created:', user);

            // Second API call: Generate JWT after the user is created
            const loginResponse = await fetch(`${baseURL}/access_tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!loginResponse.ok) {
                throw new Error('Failed to log in');
            }

            const result = await loginResponse.json();
            console.log('Login successful:', result);

            // Save JWT token in local storage
            localStorage.setItem('jwtToken', result.token);
            console.log('Saved JWT token:', localStorage.getItem('jwtToken'));

            // You can redirect or update the UI after successful signup
            window.location.href = '/';  // Redirect to dashboard after signup
        } catch (error) {
            setError(error.message);
        }
    };


    const switchToLogin = () => {
        window.location.href = '/login';
        console.log('Switch to login page');
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 relative">
            {/* Background Container */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Adjusted abstract shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 left-32 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            </div>

            {/* Signup Form */}

            <div className="w-full max-w-md bg-white p-8 rounded shadow-lg z-10">
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="SyncDraft Logo" className="w-12 h-12 bg-gray-400 rounded-full mb-4" />
                    <h1 className="text-2xl font-bold">Join SyncDraft</h1>
                    <p className="text-gray-600">Create your account</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">First Name</label>
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg bg-gray-100"
                        placeholder="Enter your Name"
                        value={Name}
                        onChange={(e) => setName(e.target.value)}
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
                <p className="text-gray-600 text-center mt-4">
                    Already have an account?{' '}
                    <span
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={switchToLogin}
                    >
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
