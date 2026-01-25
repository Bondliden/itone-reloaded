export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  country: string;
  language: string;
  createdAt: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  subscriptionTier?: 'free' | 'silver' | 'gold' | 'pro' | 'platinum';
  name?: string;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  publicProfile: boolean;
  autoPlayNext: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  acceptTerms: boolean;
}

export interface GoogleAuthResponse {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}