// Import statements at the top
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    // Login State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        countryCode: '',
    });

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/users/login', {
                identifier: identifier.trim(),
                password: password.trim(),
            });

            console.log('Login response status:', response.status);
            console.log('Login response data type:', typeof response.data);
            console.log('Login response data:', response.data);

            // Backend returns JSON: { "token": "JWT_TOKEN" }
            let token = '';
            
            if (typeof response.data === 'object' && response.data.token) {
                token = response.data.token;
            } else if (typeof response.data === 'string') {
                // Handle string response - try to parse as JSON first
                try {
                    const parsed = JSON.parse(response.data);
                    if (parsed.token) {
                        token = parsed.token;
                    }
                } catch (e) {
                    // If not JSON, try to extract JWT from string
                    const jwtMatch = response.data.match(/eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_.+/=]*/);
                    if (jwtMatch) {
                        token = jwtMatch[0];
                    } else {
                        // Assume the whole string is the token
                        token = response.data.trim();
                    }
                }
            }

            if (token && token.length > 20) {  // Valid JWT tokens are typically long
                console.log('Token extracted successfully:', token.substring(0, 20) + '...');
                localStorage.setItem('token', token);
                // Set default authorization header for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                navigate('/dashboard');
            } else {
                console.error('Failed to parse token. Received:', response.data);
                setError('Login failed. Invalid token received from server.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials.';
            setError(typeof msg === 'string' ? msg : 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/api/users/register', registerData);
            setIsLogin(true); // Switch to login tab
            setError('');
            // Show success modal instead of alert
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Register error:', err);
            const msg = err.response?.data?.message || err.response?.data || 'Registration failed.';
            setError(typeof msg === 'string' ? msg : 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-600">
                            Banking Portal
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            {isLogin ? 'Sign in to access your dashboard' : 'Create a new account'}
                        </p>
                    </div>

                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`w-1/2 py-2 text-center ${isLogin ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => { setIsLogin(true); setError(''); }}
                        >
                            Login
                        </button>
                        <button
                            className={`w-1/2 py-2 text-center ${!isLogin ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => { setIsLogin(false); setError(''); }}
                        >
                            Register
                        </button>
                    </div>

                    {isLogin ? (
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Account Number or Email</label>
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleRegister}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={registerData.name}
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Country Code</label>
                                    <input
                                        name="countryCode"
                                        type="text"
                                        placeholder="IN"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={registerData.countryCode}
                                        onChange={handleRegisterChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        name="phoneNumber"
                                        type="text"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={registerData.phoneNumber}
                                        onChange={handleRegisterChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    name="address"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={registerData.address}
                                    onChange={handleRegisterChange}
                                />
                            </div>
                            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">Registration Successful!</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Your account has been created successfully. Please login to access your account.
                                </p>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        // Optionally auto-switch to login
                                        setIsLogin(true);
                                    }}
                                >
                                    Continue to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;