import React, { useState } from 'react';
import logo from './assets/logo.png'; // Same logo used in previous pages
import './AbstractBackground.css'; // New CSS file for abstract background styles

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        setError(null);
        try {
            const response = await fetch('YOUR_LOGIN_API_ENDPOINT_HERE', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid email or password');
            }

            const result = await response.json();
            console.log('Login successful:', result);
        } catch (error) {
            setError(error.message);
        }
    };

    const switchToSignup = () => {
        console.log('Switch to signup page');
    };

    return (
        <div className="background-container flex h-screen items-center justify-center">
            <div className="shape shape1"></div>
            <div className="shape shape2"></div>
            <div className="shape shape3"></div>
            <div className="w-full max-w-md bg-white p-8 rounded shadow-lg relative z-10">
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="SyncDraft Logo" className="w-12 h-12 bg-gray-400 rounded-full mb-4" />
                    <h1 className="text-2xl font-bold">Welcome Back to SyncDraft</h1>
                    <p className="text-gray-600">Please login to continue</p>
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
                    onClick={handleLogin}
                >
                    Login
                </button>
                <p className="text-gray-600 text-center mt-4">
                    Don't have an account?{' '}
                    <span
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={switchToSignup}
                    >
                        Sign up here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
