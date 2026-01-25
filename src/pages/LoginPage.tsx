import React from 'react';
import { Link } from 'wouter';
import { Mic, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login, loading } = useAuth();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const handleGoogleLogin = () => {
    login();
  };

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just log in with any credentials
    login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Mic className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">iTone</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-300">
              {isSignUp ? 'Join the karaoke community' : 'Sign in to start your karaoke journey'}
            </p>
          </div>

          {/* Manual Registration/Login Form */}
          <form onSubmit={handleManualAuth} className="space-y-4 mb-6">
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  required
                />
              </div>
            )}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-full transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">or</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 mb-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            ) : (
              <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
              </>
            )}
          </Button>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 hover:bg-white/10"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Demo mode - Any credentials will work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}