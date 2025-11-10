
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';

interface AuthContextType {
    currentUser: string | null;
    profilePic: string | null;
    name: string;
    login: (email: string) => void;
    logout: () => void;
    setProfilePic: (pic: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [profilePic, setProfilePicState] = useState<string | null>(null);

    const userKey = 'soulfulHubUser';

    const name = useMemo(() => {
        if (!currentUser) return '';
        const emailName = currentUser.split('@')[0];
        // Capitalize the first letter
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }, [currentUser]);
    
    useEffect(() => {
        const storedUser = localStorage.getItem(userKey);
        if (storedUser) {
            setCurrentUser(storedUser);
            const storedPic = localStorage.getItem(`soulfulHubPic_${storedUser}`);
            if (storedPic) {
                setProfilePicState(storedPic);
            }
        }
    }, []);

    const login = (email: string) => {
        localStorage.setItem(userKey, email);
        setCurrentUser(email);
        const storedPic = localStorage.getItem(`soulfulHubPic_${email}`);
        if (storedPic) {
            setProfilePicState(storedPic);
        }
    };

    const logout = () => {
        localStorage.removeItem(userKey);
        // We can choose to keep the profile pic in localStorage or remove it
        setCurrentUser(null);
        setProfilePicState(null);
    };

    const setProfilePic = (pic: string) => {
        if(currentUser) {
            localStorage.setItem(`soulfulHubPic_${currentUser}`, pic);
            setProfilePicState(pic);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, profilePic, name, login, logout, setProfilePic }}>
            {children}
        </AuthContext.Provider>
    );
};
