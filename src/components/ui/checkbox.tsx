/**
 * Checkbox Component
 */

import * as React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      onCheckedChange?.(isChecked);
      onChange?.(event);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className={cn(
            'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white',
            className
          )}
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        {checked && (
          <CheckIcon className="absolute left-0 top-0 h-4 w-4 text-white pointer-events-none" />
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
