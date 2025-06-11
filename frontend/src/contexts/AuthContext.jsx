import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // API base URL - TỰ ĐỘNG CHUYỂN ĐỔI dựa trên environment
    const API_BASE_URL = import.meta.env.VITE_API_URL || 
                        (import.meta.env.PROD 
                            ? 'https://cocktail-miami-api.onrender.com' // Thay bằng URL Render thật
                            : 'http://localhost:5000');

    console.log('🌐 Current Environment:', import.meta.env.MODE);
    console.log('🔗 API_BASE_URL:', API_BASE_URL);

    // Helper function for API calls
    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            return response;
        } catch (error) {
            console.error('❌ API call failed:', error);
            throw error;
        }
    };

    // Khởi tạo auth state khi app load
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            
            if (storedToken) {
                try {
                    const response = await apiCall('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            setUser(result.data.user);
                            setToken(storedToken);
                        } else {
                            localStorage.removeItem('token');
                            setToken(null);
                        }
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
    };

    const logout = async () => {
        try {
            if (token) {
                await apiCall('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        }
    };

    const updateUser = (updatedUserData) => {
        setUser(prev => ({ ...prev, ...updatedUserData }));
    };

    const value = {
        user,
        token,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user && !!token,
        isEmailVerified: user?.isEmailVerified || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};