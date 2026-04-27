import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import api from '../../api/axios';

const Layout = () => {
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/api/dashboard/user');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data', error);
            }
        };
        
        // Mock notifications
        setNotifications([
            { id: 1, title: 'Account Statement Ready', message: 'Your monthly statement is available for download', time: '2 hours ago', read: false },
            { id: 2, title: 'Security Alert', message: 'New login detected from a new device', time: '1 day ago', read: true },
            { id: 3, title: 'Payment Received', message: 'You received a payment of $250.00', time: '2 days ago', read: true },
        ]);
        
        fetchUserData();
    }, []);
    
    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navigation Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center">
                            <button 
                                className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">OneStopBank</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">Enterprise Banking Portal</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button 
                                    className="p-2 text-gray-500 hover:text-gray-700 relative"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H6" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-gray-500">
                                                    No new notifications
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {notifications.map(notification => (
                                                        <div 
                                                            key={notification.id} 
                                                            className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                                                {!notification.read && (
                                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">New</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                            <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-200 text-center">
                                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                                View All
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* User Profile */}
                            <div className="relative">
                                <div className="flex items-center space-x-3">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500">{user?.email || 'User Account'}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Mobile overlay */}
                    {sidebarOpen && (
                        <div 
                            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        ></div>
                    )}
                    
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
