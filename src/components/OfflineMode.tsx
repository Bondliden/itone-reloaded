import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useAuth } from '../modules/auth';

interface OfflineModeProps {
  className?: string;
}

interface OfflineData {
  songs: any[];
  recordings: any[];
  userProfile: any;
  lastSync: Date;
}

export function OfflineMode({ className }: OfflineModeProps) {
  const { state: { user } } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('itone-offline-data');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const saveOfflineData = async () => {
    if (!user) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate downloading data for offline use
      const data: OfflineData = {
        songs: [], // Would fetch user's saved songs
        recordings: [], // Would fetch user's recordings
        userProfile: user,
        lastSync: new Date()
      };

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      localStorage.setItem('itone-offline-data', JSON.stringify(data));
      setOfflineData(data);

    } catch (error) {
      console.error('Failed to save offline data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncData = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate syncing offline changes back to server
      for (let i = 0; i <= 100; i += 20) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update last sync time
      if (offlineData) {
        const updatedData = { ...offlineData, lastSync: new Date() };
        localStorage.setItem('itone-offline-data', JSON.stringify(updatedData));
        setOfflineData(updatedData);
      }

    } catch (error) {
      console.error('Failed to sync data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('itone-offline-data');
    setOfflineData(null);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          {isOnline ? (
            <Wifi className="h-5 w-5 mr-2 text-green-400" />
          ) : (
            <WifiOff className="h-5 w-5 mr-2 text-red-400" />
          )}
          Offline Mode
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isOnline 
            ? 'bg-green-600/20 text-green-400' 
            : 'bg-red-600/20 text-red-400'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {!isOnline && (
        <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">You're Offline</span>
          </div>
          <p className="text-gray-300 text-sm">
            You can still access downloaded content and record new performances. 
            Changes will sync when you're back online.
          </p>
        </div>
      )}

      {/* Offline Data Status */}
      {offlineData ? (
        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Downloaded Content</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Songs:</span>
                <span className="text-white">{offlineData.songs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Recordings:</span>
                <span className="text-white">{offlineData.recordings.length}</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Last synced: {offlineData.lastSync.toLocaleString()}
            </p>
          </div>

          <div className="flex space-x-2">
            {isOnline && (
              <Button
                onClick={syncData}
                disabled={isSyncing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={clearOfflineData}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-white font-medium mb-2">No Offline Content</h4>
          <p className="text-gray-400 text-sm mb-4">
            Download your favorite songs and recordings for offline access
          </p>
          <Button
            onClick={saveOfflineData}
            disabled={isSyncing || !isOnline}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSyncing ? (
              <>
                <Download className="h-4 w-4 mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download for Offline
              </>
            )}
          </Button>
        </div>
      )}

      {/* Sync Progress */}
      {isSyncing && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">
              {syncProgress < 100 ? 'Syncing...' : 'Complete!'}
            </span>
            <span className="text-white text-sm">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}