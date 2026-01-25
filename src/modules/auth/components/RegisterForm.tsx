import React, { useState } from 'react';
import { Mail, Lock, User, Chrome, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuth } from '../hooks/useAuth';
import type { RegisterData } from '../types';

export function RegisterForm() {
  const { actions, state } = useAuth();
  const [data, setData] = useState<RegisterData>({
    email: '',
    password: '',
    username: '',
    displayName: '',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.acceptTerms) {
      return;
    }
    
    try {
      await actions.register(data);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await actions.loginWithGoogle();
    } catch (error) {
      console.error('Google registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Display Name"
            value={data.displayName}
            onChange={(e) => setData({...data, displayName: e.target.value})}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Username (unique)"
            value={data.username}
            onChange={(e) => {
              const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
              setData({...data, username});
            }}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Email address"
            value={data.email}
            onChange={(e) => setData({...data, email: e.target.value})}
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
            value={data.password}
            onChange={(e) => setData({...data, password: e.target.value})}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={data.acceptTerms}
          onChange={(e) => setData({...data, acceptTerms: e.target.checked})}
          className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900"
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-300">
          I accept the Terms of Service and Privacy Policy
        </label>
      </div>

      <Button
        type="submit"
        disabled={state.loading || !data.acceptTerms}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 font-semibold"
      >
        {state.loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
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