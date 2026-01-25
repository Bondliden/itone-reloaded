import { i18nService } from '../../i18n';
import type { User, LoginCredentials, RegisterData } from '../types';

class AuthService {
  private readonly DEMO_MODE = true; // Force demo mode for all OAuth

  async register(data: RegisterData): Promise<User> {
    // Always use demo mode for now to avoid Supabase connection issues
    const country = await this.detectUserCountry();
    const language = await this.detectUserLanguage();
    
    // Enhanced mock user with more realistic data
    const mockUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      username: data.username.toLowerCase(),
      displayName: data.displayName,
      avatar: this.generateAvatarUrl(data.displayName),
      country,
      language,
      createdAt: new Date().toISOString(),
      isEmailVerified: false,
      preferences: {
        language,
        theme: 'dark',
        notifications: true,
        publicProfile: true,
        autoPlayNext: true
      }
    };
    
    // Simulate registration delay for realism
    await this.simulateNetworkDelay(800);
    
    // Store with expiration for better demo experience
    const authData = {
      user: mockUser,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem('karaoke-auth', JSON.stringify(authData));
    return mockUser;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Enhanced demo login with validation
    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const country = await this.detectUserCountry();
    const language = await this.detectUserLanguage();
    
    // Simulate login delay for realism
    await this.simulateNetworkDelay(600);
    
    // Enhanced mock user with better data
    const mockUser: User = {
      id: crypto.randomUUID(),
      email: credentials.email,
      username: this.generateUsernameFromEmail(credentials.email),
      displayName: this.generateDisplayNameFromEmail(credentials.email),
      avatar: this.generateAvatarUrl(credentials.email),
      country,
      language,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Random date in past year
      isEmailVerified: true,
      preferences: {
        language,
        theme: 'dark',
        notifications: true,
        publicProfile: Math.random() > 0.3, // 70% have public profiles
        autoPlayNext: Math.random() > 0.2 // 80% have auto-play enabled
      }
    };
    
    const authData = {
      user: mockUser,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    
    localStorage.setItem('karaoke-auth', JSON.stringify(authData));
    return mockUser;
  }

  async loginWithGoogle(): Promise<User> {
    // ALWAYS use mock Google authentication to avoid Supabase connection issues
    const country = await this.detectUserCountry();
    const language = await this.detectUserLanguage();
    
    // Simulate OAuth flow delay for realism
    await this.simulateNetworkDelay(1200);
    
    // In demo mode, create a realistic user based on browser/system info
    // This simulates what would come from actual Google OAuth
    const browserInfo = navigator.userAgent;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Create a consistent demo user based on browser fingerprint
    const hash = this.simpleHash(browserInfo + timezone);
    const names = [
      'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Williams', 
      'Michael Brown', 'Emma Davis', 'James Wilson', 'Lisa Anderson'
    ];
    const selectedName = names[hash % names.length];
    const email = selectedName.toLowerCase().replace(' ', '.') + '@gmail.com';
    
    const mockGoogleUser: User = {
      id: crypto.randomUUID(),
      email: email,
      username: this.generateUsernameFromEmail(email),
      displayName: selectedName,
      avatar: this.generateGoogleAvatarUrl(selectedName),
      country,
      language,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(), // Random date in past 6 months
      isEmailVerified: true,
      preferences: {
        language,
        theme: 'dark',
        notifications: true,
        publicProfile: true,
        autoPlayNext: true
      }
    };
    
    const authData = {
      user: mockGoogleUser,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    
    localStorage.setItem('karaoke-auth', JSON.stringify(authData));
    return mockGoogleUser;
  }

  async logout(): Promise<void> {
    // Clean up all auth data
    localStorage.removeItem('karaoke-auth');
    localStorage.removeItem('karaoke-user'); // Legacy cleanup
    
    // Clear any cached data
    localStorage.removeItem('itone-saved-songs');
    sessionStorage.clear();
    
    // Simulate logout delay
    await this.simulateNetworkDelay(300);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const storedAuth = localStorage.getItem('karaoke-auth');
      if (!storedAuth) return null;
      
      const authData = JSON.parse(storedAuth);
      
      // Check if session expired
      if (Date.now() > authData.expiresAt) {
        localStorage.removeItem('karaoke-auth');
        return null;
      }
      
      return authData.user;
    } catch (error) {
      console.error('Error retrieving current user:', error);
      localStorage.removeItem('karaoke-auth');
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const authData = JSON.parse(localStorage.getItem('karaoke-auth') || '{}');
    if (!authData.user) throw new Error('No user found');
    
    const updatedUser = {
      ...authData.user,
      ...updates,
      username: updates.username?.toLowerCase() || authData.user.username
    };
    
    // Simulate API delay
    await this.simulateNetworkDelay(400);
    
    localStorage.setItem('karaoke-auth', JSON.stringify({
      ...authData,
      user: updatedUser
    }));
    
    return updatedUser;
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    // Simulate API call delay
    await this.simulateNetworkDelay(300);
    
    // Mock some taken usernames for demo
    const takenUsernames = [
      'admin', 'user', 'test', 'demo', 'karaoke', 'singer',
      'music', 'voice', 'star', 'performer', 'artist'
    ];
    
    return !takenUsernames.includes(username.toLowerCase());
  }

  // Private helper methods for enhanced user generation
  private generateUsernameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    const cleanUsername = localPart.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const randomSuffix = Math.floor(Math.random() * 999) + 1;
    return `${cleanUsername}${randomSuffix}`;
  }

  private generateDisplayNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[._-]/);
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private generateAvatarUrl(identifier: string): string {
    // Use a variety of professional portrait photos from Pexels
    const avatars = [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop'
    ];
    
    // Deterministic selection based on identifier
    const hash = this.simpleHash(identifier.toLowerCase());
    return avatars[hash % avatars.length];
  }

  private generateGoogleAvatarUrl(displayName: string): string {
    // Different set for Google users
    const googleAvatars = [
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1545590/pexels-photo-1545590.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop'
    ];
    
    const hash = this.simpleHash(displayName.toLowerCase());
    return googleAvatars[hash % googleAvatars.length];
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async simulateNetworkDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async detectUserCountry(): Promise<string> {
    try {
      return await i18nService.detectCountry();
    } catch (error) {
      return 'US';
    }
  }

  private async detectUserLanguage(): Promise<string> {
    return i18nService.detectBrowserLanguage();
  }
}

export const authService = new AuthService();