import React from 'react';
import { Link } from 'wouter';
import { Mic, Play, Users, Music, Star, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';

export function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30`}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Itone.studio</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Sing Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Heart Out</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            The ultimate karaoke experience with thousands of songs, AI-powered recommendations, 
            real-time collaboration, and professional recording quality.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-full text-lg">
                <Mic className="h-5 w-5 mr-2" />
                Start Singing
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg"
              onClick={() => window.open('https://www.youtube.com/watch?v=demo', '_blank')}
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <Users className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Collaborate Live</h3>
              <p className="text-gray-300">
                Sing with friends in real-time. Up to 4 people can join the same session and create amazing collaborative performances.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <Music className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Massive Library</h3>
              <p className="text-gray-300">
                Thousands of songs across all genres. From classic rock to modern pop, find your perfect song with AI-powered recommendations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <Star className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Pro Recording</h3>
              <p className="text-gray-300">
                Professional HD recording with advanced audio effects, key transpose, and real-time vocal coaching powered by AI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <span className="text-white font-bold">Itone.studio</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 iTone. All rights reserved. Sing your heart out.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}