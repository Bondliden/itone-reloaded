import React, { useState } from 'react';
import { Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types';

export function LoginForm() {
  const { actions, state } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actions.login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await actions.loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Email address"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={state.loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 font-semibold"
      >
        {state.loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-900 px-2 text-gray-400">or</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={state.loading}
        variant="outline"
        className="w-full border-white/20 text-white hover:bg-white/10"
      >
        <Chrome className="h-4 w-4 mr-2" />
        Continue with Google
      </Button>
    </form>
  );
}