/**
 * Slider Component
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);
      onValueChange([newValue]);
    };

    const currentValue = value[0] || 0;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center', className)} ref={ref} {...props}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
          <div
            className="absolute h-full bg-blue-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="absolute h-4 w-4 rounded-full border border-gray-300 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
