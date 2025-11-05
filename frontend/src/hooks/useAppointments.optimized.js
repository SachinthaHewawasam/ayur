import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import appointmentService from '../services/appointment.service';
import { toast } from 'react-hot-toast';

// Optimized query configuration to prevent rate limiting
const queryConfig = {
  staleTime: 30 * 1000, // 30 seconds
  cacheTime: 2 * 60 * 1000, // 2 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

// Request batching and deduplication
const createQueryKey = (base, params = {}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );
  return [base, filteredParams];
};

export const useAppointments = (filters = {}) => {
  return useQuery({
    queryKey: createQueryKey('appointments', filters),
    queryFn: () => appointmentService.getAllAppointments(filters),
    ...queryConfig,
    // Prevent duplicate requests
    staleTime: filters.date || filters.status ? 60 * 1000 : 30 * 1000,
  });
};

export const useAppointment = (id) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointmentById(id),
    enabled: !!id,
    ...queryConfig,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTodayAppointments = () => {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: appointmentService.getTodayAppointments,
    ...queryConfig,
    staleTime: 2 * 60 * 1000, // 2 minutes for today's appointments
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    // Removed refetchInterval to prevent excessive API calls
  });
};

export const useFollowUps = () => {
  return useQuery({
    queryKey: ['follow-ups'],
    queryFn: appointmentService.getFollowUps,
    ...queryConfig,
    staleTime: 2 * 60 * 1000, // 2 minutes for follow-ups
  });
};

export const useAppointmentsByDate = (date) => {
  return useQuery({
    queryKey: ['appointments', 'date', date],
    queryFn: () => appointmentService.getAppointmentsByDate(date),
    enabled: !!date,
    ...queryConfig,
  });
};

// Mutations with optimized cache invalidation
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: () => {
      // Batch invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      toast.success('Appointment created successfully');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create appointment');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => appointmentService.updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      toast.success('Appointment updated successfully');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update appointment');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// Status management mutations with rate limiting handling
export const useStartAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentService.startAppointment,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      toast.success('Appointment started');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to start appointment');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => appointmentService.completeAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      toast.success('Appointment completed');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to complete appointment');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useMarkAsMissed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => appointmentService.markAsMissed(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      toast.success('Appointment marked as missed');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to mark as missed');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => appointmentService.cancelAppointment(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      toast.success('Appointment cancelled');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to cancel appointment');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// Optimized status rules
export const useStatusRules = (id) => {
  return useQuery({
    queryKey: ['appointment-status-rules', id],
    queryFn: () => appointmentService.getStatusRules(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Batch operations for multiple appointments
export const useBatchOperations = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
    },
    
    invalidateById: (id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
    }
  };
};
