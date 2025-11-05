import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import Button from './Button';

const EmptyState = forwardRef(({ 
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props 
}, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn('text-center py-12', className)} 
      {...props}
    >
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-400" />
      )}
      {title && (
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick} {...action.buttonProps}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
