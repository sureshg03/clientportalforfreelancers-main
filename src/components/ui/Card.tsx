import { ReactNode, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, hover = false, glass = false, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl transition-all duration-300',
        {
          'bg-white border border-gray-200 shadow-sm': !glass,
          'bg-white/80 backdrop-blur-md border border-white/20 shadow-lg': glass,
          'hover:shadow-md hover:scale-[1.02] cursor-pointer': hover,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}
