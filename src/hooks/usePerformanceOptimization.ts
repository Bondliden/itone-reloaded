import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

export function usePerformanceOptimization() {
  const metricsRef = useRef<PerformanceMetrics>({ renderTime: 0, memoryUsage: 0, fps: 0 });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Debounce function for expensive operations
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Throttle function for frequent operations
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Lazy loading for images
  const lazyLoadImage = useCallback((src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Virtual scrolling helper
  const useVirtualScrolling = useCallback((
    items: any[],
    itemHeight: number,
    containerHeight: number,
    scrollTop: number
  ) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, []);

  // Memory cleanup
  const cleanup = useCallback(() => {
    // Clean up any intervals, timeouts, or event listeners
    if (typeof window !== 'undefined') {
      // Force garbage collection if available (development only)
      if (window.gc && process.env.NODE_ENV === 'development') {
        window.gc();
      }
    }
  }, []);

  // Performance monitoring
  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        metricsRef.current.fps = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Memory usage monitoring
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1048576; // MB
      }
    };

    const interval = setInterval(measureMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    debounce,
    throttle,
    lazyLoadImage,
    useVirtualScrolling,
    cleanup,
    metrics: metricsRef.current
  };
}