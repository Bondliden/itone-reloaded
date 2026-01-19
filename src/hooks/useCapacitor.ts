import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export function useCapacitor() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const initializeCapacitor = async () => {
      setIsNative(Capacitor.isNativePlatform());

      if (Capacitor.isNativePlatform()) {
        // Get device info
        const device = await Device.getInfo();
        setDeviceInfo(device);

        // Get network status
        const status = await Network.getStatus();
        setNetworkStatus(status);

        // Set up network listener
        Network.addListener('networkStatusChange', (status) => {
          setNetworkStatus(status);
        });

        // Configure status bar
        if (device.platform === 'ios') {
          await StatusBar.setStyle({ style: Style.Dark });
        }

        // Hide splash screen
        await SplashScreen.hide();
      }
    };

    initializeCapacitor();
  }, []);

  const shareContent = async (content: { title: string; text: string; url?: string }) => {
    if (Capacitor.isNativePlatform()) {
      await Share.share(content);
    } else {
      // Fallback for web
      if (navigator.share) {
        await navigator.share(content);
      } else {
        navigator.clipboard.writeText(content.url || content.text);
      }
    }
  };

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      // Camera and microphone permissions are handled by the WebView automatically
      // when getUserMedia is called
      return { camera: 'granted', microphone: 'granted' };
    }
    
    // Web permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return { camera: 'granted', microphone: 'granted' };
    } catch (error) {
      return { camera: 'denied', microphone: 'denied' };
    }
  };

  return {
    isNative,
    deviceInfo,
    networkStatus,
    shareContent,
    requestPermissions,
    platform: deviceInfo?.platform || 'web'
  };
}