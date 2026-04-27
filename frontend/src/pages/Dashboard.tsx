import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [account, setAccount] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>({
        monthlyIncome: 0,
        monthlySpending: 0,
        savingsRate: 0,
        transactionTrends: [],
        transactionTypes: []
    });
    const [alerts, setAlerts] = useState<any[]>([
        { id: 1, type: 'success', message: 'Your account is secure and up to date', time: '2 hours ago' },
        { id: 2, type: 'warning', message: 'Unusual login detected from new device', time: '1 day ago' },
        { id: 3, type: 'info', message: 'Monthly statement ready for download', time: '3 days ago' }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [userRes, accountRes, txRes] = await Promise.all([
                    api.get('/api/dashboard/user'),
                    api.get('/api/dashboard/account'),
                    api.get('/api/account/transactions')
                ]);
                
                setUser(userRes.data);
                setAccount(accountRes.data);
                const recentTransactions = txRes.data.slice(0, 10);
                setTransactions(recentTransactions);
                
                // Calculate analytics
                calculateAnalytics(recentTransactions);
                
            } catch (error) {
                console.error('Fetching dashboard data failed', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const calculateAnalytics = (txns: any[]) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentTxns = txns.filter(t => new Date(t.transactionDate) > thirtyDaysAgo);
        
        const income = recentTxns
            .filter(t => t.transactionType === 'CASH_DEPOSIT')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const spending = recentTxns
            .filter(t => t.transactionType !== 'CASH_DEPOSIT')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const savingsRate = income > 0 ? ((income - spending) / income) * 100 : 0;
        
        // Mock trend data
        const trendData = [
            { month: 'Jan', income: 2400, spending: 1800 },
            { month: 'Feb', income: 2800, spending: 2100 },
            { month: 'Mar', income: 3200, spending: 2300 },
            { month: 'Apr', income: 2900, spending: 2000 },
            { month: 'May', income: 3500, spending: 2400 },
            { month: 'Jun', income: 3100, spending: 2200 }
        ];
        
        // Transaction type breakdown
        const typeCounts = recentTxns.reduce((acc, t) => {
            const type = t.transactionType.replace('_', ' ');
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
        
        setAnalytics({
            monthlyIncome: income,
            monthlySpending: spending,
            savingsRate: Math.max(0, savingsRate),
            transactionTrends: trendData,
            transactionTypes: typeData
        });
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!user || !account) {
        return (
            <div className="p-8 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-yellow-800">
                        <h3 className="font-medium text-lg mb-2">Unable to load dashboard</h3>
                        <p className="text-sm">Please refresh the page or contact support if this issue persists.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Financial Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user.name.split(' ')[0]}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Account</p>
                    <p className="font-mono text-sm md:text-base font-semibold text-gray-800">
                        {account.accountNumber || user.accountNumber}
                    </p>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
                            <p className="text-2xl font-bold mt-1">${account.balance?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="bg-blue-500 bg-opacity-30 p-3 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-500 border-opacity-30">
                        <p className="text-blue-100 text-xs">Account Status</p>
                        <div className="flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                            <span className="text-sm font-medium">Active</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Monthly Income</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">+${analytics.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Monthly Spending</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">-${analytics.monthlySpending.toFixed(2)}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Savings Rate</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">{analytics.savingsRate.toFixed(1)}%</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Trends */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.transactionTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="spending" fill="#ef4444" name="Spending" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Types */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.transactionTypes}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {analytics.transactionTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Alerts */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                                alert.type === 'success' ? 'bg-green-50 border-green-500' :
                                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-blue-50 border-blue-500'
                            }`}>
                                <div className="flex items-start">
                                    <div className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                                        alert.type === 'success' ? 'text-green-500' :
                                        alert.type === 'warning' ? 'text-yellow-500' :
                                        'text-blue-500'
                                    }`}>
                                        {alert.type === 'success' && (
                                            <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        )}
                                        {alert.type === 'warning' && (
                                            <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        )}
                                        {alert.type === 'info' && (
                                            <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${
                                            alert.type === 'success' ? 'text-green-800' :
                                            alert.type === 'warning' ? 'text-yellow-800' :
                                            'text-blue-800'
                                        }`}>
                                            {alert.message}
                                        </p>
                                        <p className={`text-xs mt-1 ${
                                            alert.type === 'success' ? 'text-green-600' :
                                            alert.type === 'warning' ? 'text-yellow-600' :
                                            'text-blue-600'
                                        }`}>
                                            {alert.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                                View All
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    <h4 className="text-gray-900 font-medium mb-2">No transactions yet</h4>
                                    <p className="text-gray-500 text-sm">Your recent transactions will appear here once you start using your account.</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((transaction, index) => (
                                        <tr key={transaction.transactionId || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {transaction.transactionType?.replace('_', ' ') || 'Transaction'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.description || 'No description'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.transactionDate 
                                                    ? new Date(transaction.transactionDate).toLocaleDateString() 
                                                    : 'N/A'}
                                            </td>
                                            <td className={`px-6 py-4 text-right text-sm font-semibold ${
                                                transaction.transactionType === 'CASH_DEPOSIT' 
                                                    ? 'text-green-600' 
                                                    : 'text-gray-900'
                                            }`}>
                                                {transaction.transactionType === 'CASH_DEPOSIT' ? '+' : '-'}
                                                ${transaction.amount?.toFixed(2) || '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
