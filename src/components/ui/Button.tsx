import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:translate-y-1 active:border-b-0',
          'border-2 border-b-4 border-r-4 rounded-none',
          {
            'bg-emerald-600 text-white border-emerald-800 hover:bg-emerald-500 hover:border-emerald-700': variant === 'primary',
            'bg-cobble-700 text-cobble-100 border-cobble-900 hover:bg-cobble-600 hover:text-white': variant === 'secondary',
            'bg-red-600 text-white border-red-800 hover:bg-red-500': variant === 'danger',
            'bg-transparent text-cobble-200 hover:text-white hover:bg-cobble-800 border-transparent': variant === 'ghost',
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
