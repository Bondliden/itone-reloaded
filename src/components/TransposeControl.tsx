import React from 'react';
import { Music2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface TransposeControlProps {
  transpose: number;
  onTransposeChange: (value: number) => void;
  className?: string;
}

export function TransposeControl({ transpose, onTransposeChange, className }: TransposeControlProps) {
  const handleSliderChange = (values: number[]) => {
    onTransposeChange(values[0]);
  };

  const reset = () => {
    onTransposeChange(0);
  };

  const getTransposeText = (value: number) => {
    if (value === 0) return 'Original Key';
    return value > 0 ? `+${value} semitones` : `${value} semitones`;
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music2 className="h-5 w-5 text-purple-400" />
          <span className="text-white font-medium">Transpose</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-lg font-semibold text-white">
            {getTransposeText(transpose)}
          </span>
        </div>
        
        <Slider
          value={[transpose]}
          onValueChange={handleSliderChange}
          max={12}
          min={-12}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>-12</span>
          <span>0</span>
          <span>+12</span>
        </div>
      </div>
    </div>
  );
}