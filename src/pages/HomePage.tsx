import React from 'react';
import { Link } from 'wouter';
import { Mic, Play, Users, Music, Star, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';

export function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div 
          className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30`}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">iTone Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white border-none px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-8 tracking-tight">
          Sing Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Heart Out</span>
        </h1>
        <p className="text-xl md:text-2xl text-purple-100/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          The ultimate karaoke experience with thousands of songs, AI-powered recommendations, real-time collaboration, and professional recording quality.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/songs">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25">
              Start Singing <Music className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full">
              Watch Demo <Play className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
              <Mic className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-white">iTone.studio</span>
          </div>
          <p className="text-purple-100/40 text-sm">
            © 2025 iTone. All rights reserved. Sing your heart out.
          </p>
        </div>
      </footer>
    </div>
  );
}
