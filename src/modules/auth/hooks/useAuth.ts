import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types';
import { AuthContext, type AuthContextType } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setError(null);
      const user = await authService.getCurrentUser();
      setState({
        user,
        loading: false,
        isAuthenticated: !!user
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Authentication initialization failed');
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true }));
    setError(null);
    
    try {
      const user = await authService.login(credentials);
      setState({
        user,
        loading: false,
        isAuthenticated: true
      });
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, loading: true }));
    setError(null);
    
    try {
      // Additional validation
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (data.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (!/^[a-z0-9_]+$/.test(data.username)) {
        throw new Error('Username can only contain lowercase letters, numbers, and underscores');
      }
      
      const user = await authService.register(data);
      setState({
        user,
        loading: false,
        isAuthenticated: true
      });
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    setState(prev => ({ ...prev, loading: true }));
    setError(null);
    
    try {
      // Force demo mode to avoid any Supabase connection attempts
      const user = await authService.loginWithGoogle();
      setState({
        user,
        loading: false,
        isAuthenticated: true
      });
      setError(null);
      
      // Simulate successful OAuth completion
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await authService.logout();
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if service fails
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, loading: true }));
    setError(null);
    
    try {
      const updatedUser = await authService.updateProfile(state.user.id, updates);
      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false
      }));
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      return await authService.checkUsernameAvailability(username);
    } catch (error) {
      console.error('Username check failed:', error);
      return false; // Assume taken if check fails
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshAuth = async () => {
    await initializeAuth();
  };

  const authContextValue: AuthContextType = {
    state: {
      ...state,
      error
    },
    actions: {
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      checkUsernameAvailability,
      clearError,
      refreshAuth
    }
  };

  return authContextValue;
}