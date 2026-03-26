import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // Decode token or fetch user info
            // For now, assume admin if token exists
            setUser({ role: 'ADMIN' });
        }
    }, [token]);

    const login = async (credentials) => {
        const res = await axios.post('http://localhost:8080/api/auth/signin', credentials);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser({ role: 'ADMIN' }); // Set role as admin after login
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const isAdmin = user && user.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};