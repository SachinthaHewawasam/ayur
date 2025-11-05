import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Users, Filter, Plus, Search } from 'lucide-react';

// Hooks
import { useAppointments } from '../hooks/useAppointments';
import { 
  useStartAppointment, 
  useCompleteAppointment, 
  useMarkAsMissed, 
  useCancelAppointment 
} from '../hooks/useAppointments';

// Components
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';

// Utils
import { formatDate } from '../lib/utils';

const AppointmentsEnhanced = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    date: searchParams.get('date') || '',
    status: searchParams.get('status') || '',
    patient_id: searchParams.get('patient_id') || '',
    doctor_id: searchParams.get('doctor_id') || '',
    search: searchParams.get('search') || ''
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalReason, setModalReason] = useState('');

  // Data fetching
  const { 
    data: appointmentsData, 
    isLoading, 
    error, 
    refetch 
  } = useAppointments(filters);

  // Status mutations
  const startMutation = useStartAppointment();
  const completeMutation = useCompleteAppointment();
  const missMutation = useMarkAsMissed();
  const cancelMutation = useCancelAppointment();

  const appointments = appointmentsData?.appointments || [];
  const pagination = appointmentsData?.pagination || {};

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStatusAction = (appointment, action) => {
    if (action === 'miss' || action === 'cancel') {
      setSelectedAppointment(appointment);
      setModalAction(action);
      setShowStatusModal(true);
      return;
    }

    executeStatusChange(appointment.id, action);
  };

  const executeStatusChange = (appointmentId, action, reason = '') => {
    const mutations = {
      start: startMutation,
      complete: completeMutation,
      miss: missMutation,
      cancel: cancelMutation
    };

    const mutation = mutations[action];
    if (!mutation) return;

    // Different mutations expect different parameter structures
    let params;
    if (action === 'start') {
      params = appointmentId; // Just the ID
    } else if (action === 'complete') {
      params = { id: appointmentId, data: { reason } };
    } else if (action === 'miss' || action === 'cancel') {
      params = { id: appointmentId, reason };
    }

    mutation.mutate(params, {
      onSuccess: () => {
        refetch();
        setShowStatusModal(false);
        setModalReason('');
        
        // Redirect to appointment detail page after starting
        if (action === 'start') {
          navigate(`/appointments/${appointmentId}`);
        }
      }
    });
  };

  const getStatusActions = (status) => {
    const actions = {
      scheduled: [
        { label: 'Start', action: 'start', color: 'blue', icon: 'play' },
        { label: 'Miss', action: 'miss', color: 'orange', icon: 'flag' },
        { label: 'Cancel', action: 'cancel', color: 'red', icon: 'x' }
      ],
      in_progress: [
        { label: 'Complete', action: 'complete', color: 'green', icon: 'check' },
        { label: 'Cancel', action: 'cancel', color: 'red', icon: 'x' }
      ],
      completed: [],
      cancelled: [],
      missed: []
    };
    return actions[status] || [];
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'missed', label: 'Missed' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage 
          title="Failed to load appointments" 
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage all appointments in your clinic
          </p>
        </div>
        <Button 
          onClick={() => navigate('/appointments/new')}
          className="inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Patient name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ date: '', status: '', patient_id: '', doctor_id: '', search: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Appointments ({pagination.total || 0})
            </CardTitle>
            {pagination.total > 0 && (
              <span className="text-sm text-gray-600">
                Page {pagination.page || 1} of {pagination.totalPages || 1}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments found"
              description="No appointments match your current filters."
              action={{
                label: "Book New Appointment",
                onClick: () => navigate('/appointments/new')
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => {
                    const actions = getStatusActions(appointment.status);
                    const isLoading = startMutation.isLoading || 
                                    completeMutation.isLoading || 
                                    missMutation.isLoading || 
                                    cancelMutation.isLoading;

                    return (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.appointment_date, 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.appointment_time?.slice(0, 5)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient_code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.doctor_name || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={appointment.status} showIcon />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {actions.map((action) => (
                              <Button
                                key={action.action}
                                onClick={() => handleStatusAction(appointment, action.action)}
                                disabled={isLoading}
                                variant={action.color}
                                size="sm"
                                className="text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modalAction === 'miss' ? 'Mark as Missed' : 'Cancel Appointment'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Patient: {selectedAppointment.patient_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Date: {formatDate(selectedAppointment.appointment_date)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Time: {selectedAppointment.appointment_time}
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={modalAction === 'miss' 
                  ? 'Enter reason for missing...' 
                  : 'Enter cancellation reason...'
                }
              />
            </div>

            <div className="flex space-x-3 justify-end">
              <Button
                onClick={() => {
                  setShowStatusModal(false);
                  setModalReason('');
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => executeStatusChange(selectedAppointment.id, modalAction, modalReason)}
                disabled={
                  modalAction === 'miss' ? missMutation.isLoading : cancelMutation.isLoading
                }
                variant={modalAction === 'miss' ? 'warning' : 'danger'}
                size="sm"
              >
                {modalAction === 'miss' ? 'Mark as Missed' : 'Cancel Appointment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsEnhanced;
