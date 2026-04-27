import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const Accounts: React.FC = () => {
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accountHistory, setAccountHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await api.get('/api/dashboard/account');
                setAccount(response.data);
                
                // Generate mock account history for the chart
                const history = [];
                const baseBalance = response.data?.balance || 10000;
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i * 5);
                    history.push({
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        balance: baseBalance - Math.floor(Math.random() * 2000)
                    });
                }
                setAccountHistory(history);
            } catch (error) {
                console.error('Error fetching account', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, []);

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-red-800">
                        <h3 className="font-medium text-lg mb-2">Unable to load account details</h3>
                        <p className="text-sm">Please try refreshing the page or contact support if this issue persists.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Account Overview</h1>
                <p className="text-gray-600">View and manage your banking account details</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Primary Account Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Account Balance</p>
                            <h2 className="text-3xl md:text-4xl font-bold mt-1">${account.balance?.toFixed(2)}</h2>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    Active
                                </span>
                                <span className="text-blue-200 text-xs">{account.accountType?.replace('_', ' ') || 'Savings'}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0 bg-blue-500/20 p-3 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-blue-500/30">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-blue-100 text-xs uppercase tracking-wider">Account Number</p>
                                <p className="font-mono text-lg tracking-widest">{account.accountNumber}</p>
                            </div>
                            <div>
                                <p className="text-blue-100 text-xs uppercase tracking-wider">Branch</p>
                                <p className="text-sm">{account.branch}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                    <dl className="space-y-4">
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                            <dd className="text-sm font-semibold text-gray-900 capitalize">{account.accountType?.replace('_', ' ') || 'Savings'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
                            <dd className="text-sm font-semibold text-gray-900">{account.ifscCode}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Branch</dt>
                            <dd className="text-sm font-semibold text-gray-900">{account.branch}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Currency</dt>
                            <dd className="text-sm font-semibold text-gray-900">USD ($)</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Active
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Account History Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Account Balance History</h3>
                    <div className="text-sm text-gray-500">Last 30 days</div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={accountHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                            <Tooltip 
                                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Bar dataKey="balance" fill="#3b82f6" name="Balance" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Additional Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Statements</h4>
                    <p className="text-sm text-gray-500 mb-3">Download your account statements</p>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        Download
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Transfer</h4>
                    <p className="text-sm text-gray-500 mb-3">Send money to other accounts</p>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        Transfer Now
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <div className="mx-auto bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573 1.065c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Settings</h4>
                    <p className="text-sm text-gray-500 mb-3">Manage your account preferences</p>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        Configure
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Accounts;
