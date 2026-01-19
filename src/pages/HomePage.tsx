import React from 'react';
import { Link } from 'wouter';
import { Mic, Music, Users, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">iTone</span>
          </div>
          <Link href="/login">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Sing Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Heart Out</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The ultimate karaoke experience with thousands of songs, real-time lyrics, 
            and an amazing community of singers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200">
                Start Singing
                <Mic className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg rounded-full">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose iTone?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
              <Music className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Massive Library</h3>
              <p className="text-gray-300">
                Access thousands of songs across all genres with high-quality backing tracks.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Live Sessions</h3>
              <p className="text-gray-300">
                Join live karaoke sessions with friends or meet new people who love to sing.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
              <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Professional Quality</h3>
              <p className="text-gray-300">
                Studio-quality audio and real-time pitch correction for the perfect performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Mic className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold text-white">iTone Karaoke</span>
          </div>
          <p className="text-gray-400">
            © 2025 iTone. All rights reserved. Sing responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}