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
    const [token, setToken] = useState(null); // ✅ Khởi tạo null thay vì lấy từ localStorage ngay
    const [loading, setLoading] = useState(true);

    // ✅ API base URL - sử dụng URL production thật
    const API_BASE_URL = import.meta.env.VITE_API_URL || 
                        (import.meta.env.PROD 
                            ? 'https://cocktail-miami.onrender.com' // ✅ Sử dụng URL thật từ .env
                            : 'http://localhost:5000');

    // ✅ Chỉ log trong development
    if (import.meta.env.DEV) {
        console.log('🌐 Current Environment:', import.meta.env.MODE);
        console.log('🔗 API_BASE_URL:', API_BASE_URL);
    }

    // ✅ Helper function với retry logic và error handling
    const apiCall = async (endpoint, options = {}, retries = 2) => {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        for (let i = 0; i <= retries; i++) {
            try {
                if (import.meta.env.DEV) {
                    console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
                }
                
                const response = await fetch(url, config);
                
                // ✅ Xử lý rate limiting
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After') || '5';
                    if (i < retries) {
                        console.warn(`Rate limited. Retrying after ${retryAfter}s...`);
                        await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
                        continue;
                    }
                }
                
                return response;
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error(`❌ API call failed (attempt ${i + 1}):`, error);
                }
                
                if (i === retries) throw error;
                
                // ✅ Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    };

    // ✅ Khởi tạo auth state - với proper error handling
    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            
            const storedToken = localStorage.getItem('token');
            
            if (storedToken) {
                try {
                    const response = await apiCall('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                        }
                    });

                    if (response?.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            // ✅ Xử lý cả 2 format response
                            const userData = result.data.user || result.data;
                            setUser(userData);
                            setToken(storedToken);
                            
                            if (import.meta.env.DEV) {
                                console.log('✅ Auth initialized successfully');
                            }
                        } else {
                            // ✅ Token không hợp lệ
                            localStorage.removeItem('token');
                            setUser(null);
                            setToken(null);
                        }
                    } else {
                        // ✅ Response không OK
                        localStorage.removeItem('token');
                        setUser(null);
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                }
            }
            
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // ✅ Login function với error handling
    const login = (userData, authToken) => {
        try {
            setUser(userData);
            setToken(authToken);
            localStorage.setItem('token', authToken);
            
            if (import.meta.env.DEV) {
                console.log('✅ User logged in:', userData?.email);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    // ✅ Logout function với proper cleanup
    const logout = async () => {
        try {
            // ✅ Gọi API logout nếu có token
            if (token) {
                await apiCall('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
            }
        } catch (error) {
            // ✅ Không block logout nếu API call thất bại
            console.error('Logout API error:', error);
        } finally {
            // ✅ Luôn cleanup local state
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            
            if (import.meta.env.DEV) {
                console.log('✅ User logged out');
            }
        }
    };

    // ✅ Update user function
    const updateUser = (updatedUserData) => {
        setUser(prev => ({ ...prev, ...updatedUserData }));
    };

    // ✅ Computed values
    const isAuthenticated = !!user && !!token;
    const isEmailVerified = user?.isEmailVerified || false;

    const value = {
        user,
        token,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated,
        isEmailVerified,
        apiCall // ✅ Expose apiCall để các component khác sử dụng
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};