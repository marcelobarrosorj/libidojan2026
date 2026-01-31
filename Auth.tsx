
import React from 'react';
import { saveUserData, sanitizeInput } from './services/authUtils';

/**
 * Root level authentication logic satisfies module system.
 * Main login/register logic resides in components/Auth.tsx.
 */
interface RootAuthProps {
    email?: string;
}

const RootAuth: React.FC<RootAuthProps> = ({ email = '' }) => {
    // Utility for legacy registration flows
    const handleLegacyDone = (password: string) => {
        saveUserData({ 
          email: sanitizeInput(email), 
          nickname: email.split('@')[0],
          createdAt: new Date().toISOString()
        });
    };

    return null;
};

export default RootAuth;
