import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import patientService from '../services/patient.service';
import { toast } from 'react-hot-toast';

export const usePatients = (filters = {}) => {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientService.getAllPatients(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePatient = (id) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getPatientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patientService.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create patient');
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => patientService.updatePatient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['patients']);
      queryClient.invalidateQueries(['patient', id]);
      toast.success('Patient updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patientService.deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    },
  });
};

export const usePatientHistory = (id) => {
  return useQuery({
    queryKey: ['patient-history', id],
    queryFn: () => patientService.getPatientHistory(id),
    enabled: !!id,
  });
};

export const usePatientAppointments = (id, params = {}) => {
  return useQuery({
    queryKey: ['patient-appointments', id, params],
    queryFn: () => patientService.getPatientAppointments(id, params),
    enabled: !!id,
  });
};

export const useSearchPatients = (query, enabled = false) => {
  return useQuery({
    queryKey: ['patient-search', query],
    queryFn: () => patientService.searchPatients(query),
    enabled: enabled && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search
  });
};
