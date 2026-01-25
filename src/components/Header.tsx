import React from 'react';
import { Link } from 'wouter';
import { Mic, LogOut, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Mic className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">iTone</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Notifications */}
              <NotificationCenter />

              {/* Billing Link */}
              <Link href="/billing">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <CreditCard className="h-4 w-4" />
                </Button>
              </Link>

              {/* User Profile Dropdown */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-lg">
                    <Avatar className="h-8 w-8 border-2 border-purple-400">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <div className="text-white font-medium text-sm">{user.name}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-purple-400">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-purple-600 text-white text-lg">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <p className="text-gray-300">{user.email}</p>
                        {user.bio && <p className="text-gray-400 text-sm mt-1">{user.bio}</p>}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                onClick={logout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          {!user && (
            <Link href="/login">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}