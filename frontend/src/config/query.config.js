import { QueryClient } from '@tanstack/react-query';

// Create a custom QueryClient with rate limiting and retry logic
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce concurrent requests
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Prevent too many concurrent requests
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Request deduplication and batching
export const queryConfig = {
  // Batch similar requests
  queries: {
    appointments: {
      staleTime: 30 * 1000, // 30 seconds for appointments
      cacheTime: 2 * 60 * 1000,
    },
    medicines: {
      staleTime: 60 * 1000, // 1 minute for medicines
      cacheTime: 3 * 60 * 1000,
    },
    alerts: {
      staleTime: 2 * 60 * 1000, // 2 minutes for alerts
      cacheTime: 5 * 60 * 1000,
    },
  },
};

// Rate limiting configuration
export const rateLimitConfig = {
  // Maximum concurrent requests
  maxConcurrent: 3,
  // Request batching delay
  batchDelay: 50,
  // Retry configuration
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
};
