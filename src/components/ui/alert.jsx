
import React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
      {
        'bg-background text-foreground': variant === 'default',
        'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600': variant === 'destructive',
        'border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600': variant === 'warning',
        'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600': variant === 'info',
      },
      className
    )}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

export { Alert, AlertDescription, AlertTitle };
