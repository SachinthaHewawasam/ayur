import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Clock, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Play,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  missed: {
    label: 'Missed',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
};

const StatusBadge = forwardRef(({ 
  status, 
  size = 'sm', 
  showIcon = false, 
  className,
  ...props 
}, ref) => {
  const config = statusConfig[status] || statusConfig.scheduled;
  const Icon = config.icon;

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizes[size],
        config.color,
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
