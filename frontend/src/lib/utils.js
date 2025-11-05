import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, format = 'MMM d, yyyy') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    'MMM d, yyyy': { year: 'numeric', month: 'short', day: 'numeric' },
    'MMM dd, yyyy': { year: 'numeric', month: 'short', day: '2-digit' },
    'MM/dd/yyyy': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'EEEE, MMM d': { weekday: 'long', month: 'short', day: 'numeric' },
    'HH:mm': { hour: '2-digit', minute: '2-digit', hour12: false },
    'h:mm a': { hour: 'numeric', minute: '2-digit', hour12: true },
  };
  
  return new Intl.DateTimeFormat('en-US', options[format] || options['MMM d, yyyy']).format(d);
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    missed: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    low: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-green-100 text-green-800',
  };
  
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
