import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface AudioVisualizerProps {
  stream?: MediaStream;
  className?: string;
  type?: 'bars' | 'waveform' | 'circular';
  color?: string;
  height?: number;
  sensitivity?: number;
}

export function AudioVisualizer({
  stream,
  className,
  type = 'bars',
  color = '#8b5cf6',
  height = 100,
  sensitivity = 1
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up audio analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    setIsActive(true);

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      if (type === 'bars') {
        drawBars(ctx, dataArrayRef.current, width, height, color, sensitivity);
      } else if (type === 'waveform') {
        drawWaveform(ctx, dataArrayRef.current, width, height, color, sensitivity);
      } else if (type === 'circular') {
        drawCircular(ctx, dataArrayRef.current, width, height, color, sensitivity);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
      setIsActive(false);
    };
  }, [stream, type, color, sensitivity]);

  const drawBars = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string,
    sensitivity: number
  ) => {
    const barWidth = width / dataArray.length * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * sensitivity;

      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '40');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string,
    sensitivity: number
  ) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] / 255) * sensitivity;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawCircular = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string,
    sensitivity: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    ctx.lineWidth = 2;
    ctx.strokeStyle = color;

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2;
      const amplitude = (dataArray[i] / 255) * radius * sensitivity;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + amplitude);
      const y2 = centerY + Math.sin(angle) * (radius + amplitude);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={height}
      className={cn(
        'w-full rounded-lg',
        !isActive && 'opacity-50',
        className
      )}
      style={{ height: `${height}px` }}
    />
  );
}