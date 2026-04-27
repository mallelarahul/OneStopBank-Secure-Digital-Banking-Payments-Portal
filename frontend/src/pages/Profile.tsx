import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { logout } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    accountNumber: string;
    accountType: string;
    ifscCode: string;
    branch: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({ 
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        accountNumber: '',
        accountType: '',
        ifscCode: '',
        branch: ''
    });
    const [saveMessage, setSaveMessage] = useState<{type: string, text: string} | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/dashboard/user');
                const userData = response.data;
                setUser(userData);
                setFormData(userData);
            } catch (error: any) {
                console.error('Failed to fetch profile', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEditToggle = () => {
        if (editing) {
            // Cancel edit
            if (user) {
                setFormData(user);
            }
            setEditing(false);
        } else {
            // Start edit
            setEditing(true);
        }
        setSaveMessage(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Make API call to update user profile
            await api.post('/api/users/update', formData);
            
            // Update local state
            setUser(formData);
            setEditing(false);
            
            setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error: any) {
            console.error('Failed to update profile', error);
            setSaveMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your personal information and account details</p>
            </div>

            {saveMessage && (
                <div className={`p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {saveMessage.text}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            <p className="text-sm text-gray-500">Update your personal details</p>
                        </div>
                        <button
                            onClick={handleEditToggle}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Full Name</dt>
                        {editing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        ) : (
                            <dd className="text-lg font-semibold text-gray-900">{user?.name}</dd>
                        )}
                    </div>

                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Email Address</dt>
                        {editing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                readOnly={!editing} // Email shouldn't be editable
                            />
                        ) : (
                            <dd className="text-lg text-gray-900">{user?.email}</dd>
                        )}
                    </div>

                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Phone Number</dt>
                        {editing ? (
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        ) : (
                            <dd className="text-lg text-gray-900">{user?.phoneNumber}</dd>
                        )}
                    </div>

                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Address</dt>
                        {editing ? (
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        ) : (
                            <dd className="text-lg text-gray-900">{user?.address}</dd>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                        <p className="text-sm text-gray-500">Your account details and banking information</p>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Account Number</dt>
                        <dd className="text-lg font-mono font-bold text-gray-900">{user?.accountNumber}</dd>
                    </div>

                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Account Type</dt>
                        <dd className="text-lg capitalize text-gray-900">{user?.accountType?.replace('_', ' ') || 'Savings'}</dd>
                    </div>

                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">IFSC Code</dt>
                        <dd className="text-lg font-mono text-gray-900">{user?.ifscCode}</dd>
                    </div>

                    <div className="px-6 py-5">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Branch</dt>
                        <dd className="text-lg text-gray-900">{user?.branch}</dd>
                    </div>
                </div>
            </div>

            {editing && (
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        onClick={handleEditToggle}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;
