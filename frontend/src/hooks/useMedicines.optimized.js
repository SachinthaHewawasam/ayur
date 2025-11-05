import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import medicineService from '../services/medicine.service';
import { toast } from 'react-hot-toast';

// Optimized query configuration
const queryConfig = {
  staleTime: 60 * 1000, // 1 minute for medicines
  cacheTime: 3 * 60 * 1000, // 3 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

// Batch medicine queries to prevent rate limiting
export const useMedicines = (filters = {}) => {
  return useQuery({
    queryKey: ['medicines', filters],
    queryFn: () => medicineService.getAllMedicines(filters),
    ...queryConfig,
    staleTime: filters.search ? 30 * 1000 : 60 * 1000,
  });
};

export const useMedicine = (id) => {
  return useQuery({
    queryKey: ['medicine', id],
    queryFn: () => medicineService.getMedicineById(id),
    enabled: !!id,
    ...queryConfig,
    staleTime: 5 * 60 * 1000,
  });
};

// Optimized alert queries with reduced frequency
export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['medicines', 'alerts', 'low-stock'],
    queryFn: medicineService.getLowStockAlerts,
    ...queryConfig,
    staleTime: 3 * 60 * 1000, // 3 minutes for alerts
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    // Removed refetchInterval to prevent excessive API calls
  });
};

export const useExpiringMedicines = (days = 30) => {
  return useQuery({
    queryKey: ['medicines', 'alerts', 'expiring', days],
    queryFn: () => medicineService.getExpiringMedicines(days),
    ...queryConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    // Removed refetchInterval to prevent excessive API calls
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['medicines', 'stats'],
    queryFn: medicineService.getInventoryStats,
    ...queryConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    // Removed refetchInterval to prevent excessive API calls
  });
};

export const useMedicineCategories = () => {
  return useQuery({
    queryKey: ['medicines', 'categories'],
    queryFn: medicineService.getCategories,
    ...queryConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes for categories
  });
};

export const useSearchMedicines = (query) => {
  return useQuery({
    queryKey: ['medicines', 'search', query],
    queryFn: () => medicineService.searchMedicines(query),
    enabled: !!query && query.length >= 2,
    ...queryConfig,
    staleTime: 30 * 1000, // 30 seconds for search
  });
};

// Mutations with rate limiting handling
export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: medicineService.createMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'stats'] });
      toast.success('Medicine created successfully');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create medicine');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => medicineService.updateMedicine(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicine', id] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'stats'] });
      toast.success('Medicine updated successfully');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update medicine');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quantity }) => medicineService.updateStock(id, quantity),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicine', id] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'alerts', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'stats'] });
      toast.success('Stock updated successfully');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update stock');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: medicineService.deleteMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'stats'] });
      toast.success('Medicine deleted successfully');
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete medicine');
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// Batch operations
export const useBatchMedicineOperations = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['medicines', 'alerts'] });
    },
    
    invalidateById: (id) => {
      queryClient.invalidateQueries({ queryKey: ['medicine', id] });
    }
  };
};
