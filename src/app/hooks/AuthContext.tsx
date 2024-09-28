'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<{ isAuthenticated: boolean; setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>> }>({
    isAuthenticated: false,  // Hardcoded to true, change this for actually logging in
    setIsAuthenticated: () => {},
});

import { ReactNode } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Hardcoded to true

    useEffect(() => {
        // Logic to check if the user is authenticated (e.g., check local storage or make an API call)
        const checkAuthStatus = () => {
            // Example: Check if a token exists in local storage
            const token = false; // localStorage.getItem('token');
            setIsAuthenticated(token); // Set to true if token exists
            console.log('Auth status checked:', token);
        };

        checkAuthStatus();
    }, []);

    console.log('Initial isAuthenticated value:', isAuthenticated);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
