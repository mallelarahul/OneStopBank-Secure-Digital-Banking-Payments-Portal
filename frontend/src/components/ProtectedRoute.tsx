import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../auth/auth';
import api from '../api/axios';

const ProtectedRoute = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated()) {
                setIsAuth(false);
                setIsLoading(false);
                return;
            }

            try {
                // Test token validity with a simple API call
                await api.get('/api/dashboard/user');
                setIsAuth(true);
            } catch (error) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                setIsAuth(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
