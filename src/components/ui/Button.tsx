import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  // include 'default' as an accepted alias (maps to primary)
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  // normalize alias: treat 'default' as 'primary'
  const effectiveVariant = variant === 'default' ? 'primary' : variant;
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-md hover:shadow-lg':
            effectiveVariant === 'primary' && !disabled,
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400':
            effectiveVariant === 'secondary' && !disabled,
          'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500':
            effectiveVariant === 'outline' && !disabled,
          'text-gray-700 hover:bg-gray-100 focus:ring-gray-400':
            effectiveVariant === 'ghost' && !disabled,
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
            effectiveVariant === 'danger' && !disabled,
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'w-full': fullWidth,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
