import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          <Link to="/dashboard" className="btn btn-primary inline-flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
