import React, { createContext } from 'react';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types';

export interface ExtendedAuthState extends AuthState {
  error?: string | null;
}

export interface AuthContextType {
  state: ExtendedAuthState;
  actions: {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    checkUsernameAvailability: (username: string) => Promise<boolean>;
    clearError: () => void;
    refreshAuth: () => Promise<void>;
  };
}

export const AuthContext = createContext<AuthContextType | null>(null);