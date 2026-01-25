import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface MobileOptimizationsProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileOptimizations({ children, className }: MobileOptimizationsProps) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkDevice();
    checkOrientation();

    window.addEventListener('resize', checkDevice);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      'relative',
      deviceType === 'mobile' && 'mobile-optimized',
      deviceType === 'tablet' && 'tablet-optimized',
      orientation === 'landscape' && deviceType === 'mobile' && 'mobile-landscape',
      className
    )}>
      {/* Mobile-specific optimizations */}
      {deviceType === 'mobile' && (
        <style jsx>{`
          .mobile-optimized {
            /* Larger touch targets */
            --touch-target-size: 44px;
          }
          
          .mobile-optimized button {
            min-height: var(--touch-target-size);
            min-width: var(--touch-target-size);
          }
          
          .mobile-optimized input {
            min-height: var(--touch-target-size);
            font-size: 16px; /* Prevents zoom on iOS */
          }
          
          /* Optimize for mobile landscape */
          .mobile-landscape {
            --header-height: 60px;
          }
          
          .mobile-landscape .lyrics-display {
            font-size: 14px;
            line-height: 1.4;
          }
        `}</style>
      )}

      {/* Device Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white z-50">
          <div className="flex items-center space-x-2">
            {getDeviceIcon()}
            <span>{deviceType} • {orientation}</span>
            {deviceType === 'mobile' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10 p-1"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}