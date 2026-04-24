
import React, { createContext, useContext } from 'react';

export interface AuthContextType {
  logout: () => void;
  refreshSession: (immediate?: boolean) => Promise<void>;
  setIsUnlocked: (val: boolean) => void;
  setIsAuthenticated: (val: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
