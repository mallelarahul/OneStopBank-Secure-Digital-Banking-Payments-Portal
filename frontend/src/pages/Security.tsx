import React, { useState } from 'react';
import api from '../api/axios';

const Security: React.FC = () => {
    const [pinData, setPinData] = useState({ password: '', pin: '' });
    const [updatePinData, setUpdatePinData] = useState({ oldPin: '', newPin: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [mode, setMode] = useState<'create' | 'update'>('create');
    
    // Password reset functionality
    const [resetEmail, setResetEmail] = useState('');
    const [resetStep, setResetStep] = useState<'initial' | 'otp' | 'newPassword'>('initial');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const handlePin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            // Validate PIN format before sending
            if (mode === 'create' && (!pinData.pin || pinData.pin.length !== 4 || !/^[0-9]{4}$/.test(pinData.pin))) {
                setMessage({ type: 'error', text: 'PIN must be exactly 4 digits' });
                return;
            }
            
            if (mode === 'create') {
                // For setting new PIN, call the required endpoint with proper payload
                console.log('Sending PIN creation request:', { newPin: pinData.pin, password: '***' });
                const response = await api.post('/api/security/pin/set', {
                    password: pinData.password,
                    newPin: pinData.pin
                });
                console.log('PIN creation response:', response);
                setMessage({ type: 'success', text: 'PIN set successfully' });
                // Reset form
                setPinData({ password: '', pin: '' });
            } else {
                // For updating existing PIN, keep the existing logic
                await api.post('/api/account/pin/update', updatePinData);
                setMessage({ type: 'success', text: 'PIN updated successfully' });
                // Reset form
                setUpdatePinData({ oldPin: '', newPin: '', password: '' });
            }
        } catch (error: any) {
            console.error('PIN operation failed:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Operation failed';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        
        try {
            if (resetStep === 'initial') {
                // Request OTP
                await api.post('/api/auth/password-reset/send-otp', { email: resetEmail });
                setResetStep('otp');
                setMessage({ type: 'success', text: 'OTP sent to your email' });
            } else if (resetStep === 'otp') {
                // Verify OTP
                if (newPassword !== confirmPassword) {
                    setMessage({ type: 'error', text: 'Passwords do not match' });
                    return;
                }
                
                await api.post('/api/auth/password-reset/verify-otp', { 
                    email: resetEmail, 
                    otp, 
                    newPassword 
                });
                setResetStep('initial');
                setMessage({ type: 'success', text: 'Password reset successful' });
                
                // Reset form
                setResetEmail('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
                <p className="text-gray-600">Manage your account security and authentication methods</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PIN Management */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Account PIN</h2>
                            <p className="text-sm text-gray-500">Manage your 4-digit transaction PIN</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setMode('create')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Set New PIN
                        </button>
                        <button
                            onClick={() => setMode('update')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'update' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Change PIN
                        </button>
                    </div>

                    {message && message.type === 'success' && mode !== 'create' && mode !== 'update' && (
                        <div className="mb-4 p-4 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePin} className="space-y-4 max-w-md">
                        {mode === 'create' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Password</label>
                                    <input
                                        type="password" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Enter your account password"
                                        value={pinData.password}
                                        onChange={e => setPinData({ ...pinData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New 4-Digit PIN</label>
                                    <input
                                        type="password" required maxLength={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-[0.5em]"
                                        placeholder="••••"
                                        value={pinData.pin}
                                        onChange={e => setPinData({ ...pinData, pin: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Password</label>
                                    <input
                                        type="password" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Enter your account password"
                                        value={updatePinData.password}
                                        onChange={e => setUpdatePinData({ ...updatePinData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current PIN</label>
                                    <input
                                        type="password" required maxLength={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-[0.5em]"
                                        placeholder="••••"
                                        value={updatePinData.oldPin}
                                        onChange={e => setUpdatePinData({ ...updatePinData, oldPin: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New PIN</label>
                                    <input
                                        type="password" required maxLength={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-[0.5em]"
                                        placeholder="••••"
                                        value={updatePinData.newPin}
                                        onChange={e => setUpdatePinData({ ...updatePinData, newPin: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Processing...' : (mode === 'create' ? 'Set PIN' : 'Update PIN')}
                        </button>
                    </form>
                </div>

                {/* Password Reset */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Password Reset</h2>
                            <p className="text-sm text-gray-500">Reset your account password</p>
                        </div>
                    </div>
                    
                    {message && message.type !== 'success' && (
                        <div className="mb-4 p-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                            {message.text}
                        </div>
                    )}
                    
                    {message && message.type === 'success' && (
                        <div className="mb-4 p-4 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordReset} className="space-y-4 max-w-md">
                        {resetStep === 'initial' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="Enter your registered email"
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    Send Reset Link
                                </button>
                            </>
                        )}
                        
                        {resetStep === 'otp' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email" required readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                        value={resetEmail}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                                    <input
                                        type="text" required maxLength={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    Reset Password
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setResetStep('initial')}
                                    className="w-full mt-2 text-purple-600 hover:text-purple-800 font-medium py-2.5 rounded-lg border border-purple-200"
                                >
                                    Back to Email
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>

            {/* Security Tips */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Best Practices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Strong Passwords</h3>
                            <p className="text-sm text-gray-500">Use at least 8 characters with uppercase, lowercase, numbers and special characters</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">PIN Protection</h3>
                            <p className="text-sm text-gray-500">Never share your PIN with anyone and avoid obvious combinations</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500">Enable additional security layers when available</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Regular Monitoring</h3>
                            <p className="text-sm text-gray-500">Check your account activity regularly for suspicious transactions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
