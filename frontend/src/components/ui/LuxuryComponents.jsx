import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Luxury Card Component
export const LuxuryCard = ({ children, className = '', hover = true, gradient = false }) => {
  const baseClasses = "bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1" : "";
  const gradientClasses = gradient ? "bg-gradient-to-br from-white to-gray-50" : "";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}>
      {children}
    </div>
  );
};

// Luxury Stats Card
export const LuxuryStatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendValue, 
  gradient = "from-blue-50 to-indigo-50",
  iconColor = "text-blue-600",
  className = ""
}) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-5 border border-opacity-20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-white bg-opacity-50 rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {trendValue && (
        <div className="flex items-center text-xs">
          <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>{trendValue}</span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

// Luxury Search Bar
export const LuxurySearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  icon: Icon,
  className = ""
}) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                   transition-all duration-200 bg-gray-50 focus:bg-white
                   text-gray-900 placeholder-gray-400
                   shadow-sm focus:shadow-md"
        placeholder={placeholder}
      />
    </div>
  );
};

// Luxury Action Button
export const LuxuryButton = ({ 
  children, 
  onClick, 
  icon: Icon, 
  variant = "primary",
  size = "md",
  disabled = false,
  className = ""
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
    secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl active:scale-95'}
        ${className}
      `}
    >
      {Icon && <Icon className="h-5 w-5 mr-2" />}
      <span className="relative">{children}</span>
    </button>
  );
};

// Luxury Badge
export const LuxuryBadge = ({ 
  children, 
  variant = "default",
  dot = false,
  className = ""
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    primary: "bg-blue-100 text-blue-700 border-blue-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-orange-100 text-orange-700 border-orange-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200"
  };
  
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
      ${variants[variant]}
      ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-2 ${variant === 'success' ? 'bg-green-500' : 'bg-gray-500'}`}></span>}
      {children}
    </span>
  );
};

// Luxury Empty State
export const LuxuryEmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ""
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <LuxuryButton onClick={action.onClick} icon={action.icon}>
          {action.label}
        </LuxuryButton>
      )}
    </div>
  );
};

// Luxury Loading Skeleton
export const LuxurySkeleton = ({ className = "", count = 1 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`animate-pulse ${className}`}>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 mb-2"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

// Luxury Table Container
export const LuxuryTable = ({ children, className = "" }) => {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 shadow-lg ${className}`}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

// Luxury Table Header
export const LuxuryTableHeader = ({ children }) => {
  return (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      {children}
    </thead>
  );
};

// Luxury Table Row
export const LuxuryTableRow = ({ children, onClick, className = "" }) => {
  return (
    <tr 
      onClick={onClick}
      className={`
        hover:bg-blue-50 transition-colors duration-150
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
};

export default {
  LuxuryCard,
  LuxuryStatsCard,
  LuxurySearchBar,
  LuxuryButton,
  LuxuryBadge,
  LuxuryEmptyState,
  LuxurySkeleton,
  LuxuryTable,
  LuxuryTableHeader,
  LuxuryTableRow
};
