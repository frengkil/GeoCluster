
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock initial user
const DEFAULT_ADMIN: User = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@geocluster.com',
  role: 'admin'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('geo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Check against default admin
        if (email === 'admin@geocluster.com' && password === 'admin123') {
          setUser(DEFAULT_ADMIN);
          localStorage.setItem('geo_user', JSON.stringify(DEFAULT_ADMIN));
          resolve(true);
          return;
        }

        // Check against registered users in localStorage
        const users = JSON.parse(localStorage.getItem('geo_users_db') || '[]');
        const foundUser = users.find((u: any) => u.email === email && u.password === password);

        if (foundUser) {
          const { password, ...userWithoutPass } = foundUser;
          setUser(userWithoutPass);
          localStorage.setItem('geo_user', JSON.stringify(userWithoutPass));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const register = async (name: string, email: string, password: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('geo_users_db') || '[]');
        
        // Check if email exists
        if (users.some((u: any) => u.email === email) || email === 'admin@geocluster.com') {
          resolve(false);
          return;
        }

        const newUser = {
          id: `u${Date.now()}`,
          name,
          email,
          password, // In a real app, never store plain text passwords
          role: 'viewer' as const,
          avatar: ''
        };

        users.push(newUser);
        localStorage.setItem('geo_users_db', JSON.stringify(users));
        
        // Auto login after register
        const { password: _, ...userWithoutPass } = newUser;
        setUser(userWithoutPass);
        localStorage.setItem('geo_user', JSON.stringify(userWithoutPass));
        
        resolve(true);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('geo_user');
    router.push('/login');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('geo_user', JSON.stringify(updatedUser));

      // Update in DB
      const users = JSON.parse(localStorage.getItem('geo_users_db') || '[]');
      const index = users.findIndex((u: any) => u.email === user.email);
      if (index !== -1) {
        users[index] = { ...users[index], ...data };
        localStorage.setItem('geo_users_db', JSON.stringify(users));
      }
    }
  };

  const updatePassword = async (oldPass: string, newPass: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        if (!user) {
            resolve(false);
            return;
        }

        // Special case for default admin
        if (user.email === 'admin@geocluster.com') {
            if (oldPass === 'admin123') {
                // Cannot actually change default admin password in this mock without more complex logic
                // But we can pretend
                resolve(true);
            } else {
                resolve(false);
            }
            return;
        }

        const users = JSON.parse(localStorage.getItem('geo_users_db') || '[]');
        const index = users.findIndex((u: any) => u.email === user.email);
        
        if (index !== -1 && users[index].password === oldPass) {
            users[index].password = newPass;
            localStorage.setItem('geo_users_db', JSON.stringify(users));
            resolve(true);
        } else {
            resolve(false);
        }
      }, 800);
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      updateProfile, 
      updatePassword,
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
