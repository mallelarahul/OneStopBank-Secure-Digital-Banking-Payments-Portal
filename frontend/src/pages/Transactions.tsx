import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../api/axios';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [dateRange, setDateRange] = useState('30'); // Last 30 days
    const [analytics, setAnalytics] = useState<any>({
        totalIncome: 0,
        totalSpending: 0,
        transactionSummary: [],
        transactionDistribution: []
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get('/api/account/transactions');
                setTransactions(response.data);
                calculateAnalytics(response.data);
            } catch (error) {
                console.error('Error fetching transactions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const calculateAnalytics = (txns: any[]) => {
        const now = new Date();
        const daysBack = parseInt(dateRange);
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        
        const filteredTxns = txns.filter(t => new Date(t.transactionDate) >= startDate);
        
        const income = filteredTxns
            .filter(t => t.transactionType === 'CASH_DEPOSIT')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const spending = filteredTxns
            .filter(t => t.transactionType !== 'CASH_DEPOSIT')
            .reduce((sum, t) => sum + t.amount, 0);
            
        // Transaction type breakdown
        const typeCounts = filteredTxns.reduce((acc, t) => {
            const type = t.transactionType.replace('_', ' ');
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
        
        // Daily transaction summary for chart
        const dailySummary = filteredTxns.reduce((acc, t) => {
            const date = new Date(t.transactionDate).toDateString();
            if (!acc[date]) acc[date] = { date, deposits: 0, withdrawals: 0, transfers: 0 };
            
            if (t.transactionType === 'CASH_DEPOSIT') {
                acc[date].deposits += t.amount;
            } else if (t.transactionType === 'CASH_WITHDRAWAL') {
                acc[date].withdrawals += t.amount;
            } else {
                acc[date].transfers += t.amount;
            }
            
            return acc;
        }, {} as Record<string, any>);
        
        const summaryArray = Object.values(dailySummary);
        
        setAnalytics({
            totalIncome: income,
            totalSpending: spending,
            transactionSummary: summaryArray,
            transactionDistribution: typeData
        });
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.transactionId?.toString().includes(searchTerm) || 
                             t.targetAccountNumber?.includes(searchTerm) || 
                             t.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || t.transactionType === filter;
        
        const now = new Date();
        const daysBack = parseInt(dateRange);
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        const transactionDate = new Date(t.transactionDate);
        
        const matchesDateRange = transactionDate >= startDate;
        
        return matchesSearch && matchesFilter && matchesDateRange;
    });

    const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B'];

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-600">Track and analyze your financial activity</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Income</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">${analytics.totalIncome.toFixed(2)}</p>
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
                            <p className="text-gray-500 text-sm font-medium">Total Spending</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">${analytics.totalSpending.toFixed(2)}</p>
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
                            <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{filteredTransactions.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <BarChart data={analytics.transactionSummary.slice(0, 7)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="transfers" fill="#3b82f6" name="Transfers" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Distribution */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.transactionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={(props) => {
                                        const { name, percent } = props;
                                        return name ? `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%` : '';
                                    }}
                                >
                                    {analytics.transactionDistribution.map((entry: { name: string; value: number }, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filters and Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('ALL')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('CASH_DEPOSIT')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'CASH_DEPOSIT' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                            >
                                Deposits
                            </button>
                            <button
                                onClick={() => setFilter('CASH_WITHDRAWAL')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'CASH_WITHDRAWAL' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                            >
                                Withdrawals
                            </button>
                            <button
                                onClick={() => setFilter('CASH_TRANSFER')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'CASH_TRANSFER' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                            >
                                Transfers
                            </button>
                        </div>
                        
                        <select 
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                    
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full md:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <h4 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h4>
                                            <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.transactionId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-600">#{t.transactionId}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(t.transactionDate).toLocaleDateString()}{' '}
                                            {new Date(t.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.transactionType === 'CASH_DEPOSIT' ? 'bg-emerald-100 text-emerald-800' :
                                                t.transactionType === 'CASH_WITHDRAWAL' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {t.transactionType.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{t.description || 'N/A'}</div>
                                            {t.targetAccountNumber && (
                                                <div className="text-xs text-gray-500">To: {t.targetAccountNumber}</div>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 font-bold ${t.transactionType === 'CASH_DEPOSIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {t.transactionType === 'CASH_DEPOSIT' ? '+' : '-'} ${t.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
