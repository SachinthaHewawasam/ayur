import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred', 
  onRetry,
  className 
}) => {
  return (
    <div className={className}>
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
        {onRetry && (
          <div className="mt-4">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
