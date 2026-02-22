import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../domain/types.js';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

const getInitialAuth = () => {
    if (typeof window === 'undefined') return { token: null, user: null };

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
        try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            if (payload.exp * 1000 >= Date.now()) {
                return { token: storedToken, user: JSON.parse(storedUser) };
            }
        } catch (e) {
            console.error("Invalid token in localStorage", e);
        }
    }
    return { token: null, user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => getInitialAuth().user);
    const [token, setToken] = useState<string | null>(() => getInitialAuth().token);

    useEffect(() => {
        const checkToken = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                try {
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));
                    if (payload.exp * 1000 < Date.now()) {
                        // Expired
                        logout();
                    } else {
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    }
                } catch (e) {
                    logout();
                }
            }
        };
        checkToken();
        const interval = setInterval(checkToken, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
