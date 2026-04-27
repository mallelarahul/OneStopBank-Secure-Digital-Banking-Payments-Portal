export const logout = async () => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            // Call backend logout endpoint
            const response = await fetch('http://localhost:8180/api/users/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Logged out successfully');
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage regardless of backend response
        localStorage.removeItem('token');
        // Redirect to login
        window.location.href = '/login';
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
