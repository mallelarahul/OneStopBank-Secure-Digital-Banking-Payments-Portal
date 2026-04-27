import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Payment: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'transfer' | 'deposit' | 'withdraw'>('transfer');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    
    // Transfer State
    const [targetAccount, setTargetAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [description, setDescription] = useState('');
    
    // Account balance
    const [balance, setBalance] = useState<number | null>(null);
    
    useEffect(() => {
        // Fetch recent transactions
        const fetchRecentTransactions = async () => {
            try {
                const response = await api.get('/api/account/transactions');
                setRecentTransactions(response.data.slice(0, 5));
            } catch (error) {
                console.error('Error fetching recent transactions', error);
            }
        };
        
        // Fetch account balance
        const fetchAccountBalance = async () => {
            try {
                const response = await api.get('/api/dashboard/account');
                setBalance(response.data.balance);
            } catch (error) {
                console.error('Error fetching account balance', error);
            }
        };
        
        fetchRecentTransactions();
        fetchAccountBalance();
    }, []);

    const resetForm = () => {
        setAmount('');
        setPin('');
        setTargetAccount('');
        setRecipientName('');
        setDescription('');
        setMessage(null);
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        const payload: any = {
            accountNumber: '', // Will be populated by backend from logged-in user
            amount: parseFloat(amount),
            pin: pin
        };

        let endpoint = '';

        if (activeTab === 'transfer') {
            endpoint = '/api/account/fund-transfer';
            payload.targetAccountNumber = targetAccount;
            payload.description = description || `Transfer to ${recipientName || targetAccount}`;
        } else if (activeTab === 'deposit') {
            endpoint = '/api/account/deposit';
            payload.description = description || 'Cash deposit';
        } else {
            endpoint = '/api/account/withdraw';
            payload.description = description || 'Cash withdrawal';
        }

        try {
            console.log('Sending transaction request:', { endpoint, payload });
            const response = await api.post(endpoint, payload);
            // Extract message from response object if it's an object with msg property
            const successMessage = typeof response.data === 'object' && response.data.msg 
                ? response.data.msg 
                : response.data || 'Transaction successful';
            setMessage({ type: 'success', text: successMessage });
            
            // Refresh balance after successful transaction
            const accountResponse = await api.get('/api/dashboard/account');
            setBalance(accountResponse.data.balance);
            
            // Refresh recent transactions
            const txResponse = await api.get('/api/account/transactions');
            setRecentTransactions(txResponse.data.slice(0, 5));
            
            resetForm();
        } catch (error: any) {
            console.error('Transaction error:', error);
            console.error('Error response:', error.response?.data);
            // Extract message from error response object if it's an object with message/msg property
            let errorMessage = 'Transaction failed';
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    errorMessage = error.response.data.message || error.response.data.msg || JSON.stringify(error.response.data);
                } else {
                    errorMessage = error.response.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Payments & Transfers</h1>
                <p className="text-gray-600">Move money securely between accounts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <button
                            onClick={() => { setActiveTab('transfer'); resetForm(); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'transfer' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Fund Transfer
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab('deposit'); resetForm(); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'deposit' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                Deposit
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab('withdraw'); resetForm(); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'withdraw' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                                Withdraw
                            </div>
                        </button>
                    </div>

                    <div className="p-6">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleTransaction} className="space-y-6">
                            {activeTab === 'transfer' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Enter recipient's name"
                                                value={recipientName}
                                                onChange={e => setRecipientName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="Enter recipient's account number"
                                                value={targetAccount}
                                                onChange={e => setTargetAccount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-gray-400 text-lg font-medium">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-sm text-gray-500">
                                    <span>Available: ${balance?.toFixed(2) || '0.00'}</span>
                                    <div className="flex space-x-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setAmount((balance ? balance * 0.25 : 0).toString())}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            25%
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setAmount((balance ? balance * 0.5 : 0).toString())}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            50%
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setAmount((balance ? balance * 0.75 : 0).toString())}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            75%
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setAmount((balance || 0).toString())}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Max
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Add a note for this transaction"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction PIN</label>
                                <input
                                    type="password"
                                    required
                                    maxLength={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-[0.5em] text-center text-xl"
                                    placeholder="••••"
                                    value={pin}
                                    onChange={e => setPin(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter your 4-digit security PIN to authorize this transaction</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-4 rounded-lg text-white font-medium shadow-sm transition-all ${activeTab === 'transfer' ? 'bg-blue-600 hover:bg-blue-700' :
                                        activeTab === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                            'bg-red-600 hover:bg-red-700'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        {activeTab === 'transfer' && (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                                Transfer Funds
                                            </>
                                        )}
                                        {activeTab === 'deposit' && (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                </svg>
                                                Deposit Cash
                                            </>
                                        )}
                                        {activeTab === 'withdraw' && (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                                </svg>
                                                Withdraw Cash
                                            </>
                                        )}
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Panel - Recent Transactions and Quick Actions */}
                <div className="space-y-6">
                    {/* Account Balance */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Available Balance</p>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold">${balance?.toFixed(2) || '0.00'}</h3>
                        <p className="text-blue-200 text-sm mt-2">Your account balance is secure and up to date</p>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                        </div>
                        <div className="p-4">
                            {recentTransactions.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-sm">No recent transactions</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {recentTransactions.map((tx) => (
                                        <li key={tx.transactionId} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${tx.transactionType === 'CASH_DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {tx.transactionType === 'CASH_DEPOSIT' ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                        {tx.description || tx.transactionType.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(tx.transactionDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-semibold ${tx.transactionType === 'CASH_DEPOSIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.transactionType === 'CASH_DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setActiveTab('deposit')} 
                                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="bg-emerald-100 p-2 rounded-lg mb-2">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-700">Deposit</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('withdraw')} 
                                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="bg-red-100 p-2 rounded-lg mb-2">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-700">Withdraw</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('transfer')} 
                                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="bg-blue-100 p-2 rounded-lg mb-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-700">Transfer</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="bg-purple-100 p-2 rounded-lg mb-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-700">History</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
