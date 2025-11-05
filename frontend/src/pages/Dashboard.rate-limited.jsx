import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Clock, Plus, AlertTriangle, Package } from 'lucide-react';
import { format } from 'date-fns';

// Optimized hooks with rate limiting
import { useTodayAppointments, useFollowUps } from '../hooks/useAppointments.optimized';
import { useLowStockAlerts, useExpiringMedicines } from '../hooks/useMedicines.optimized';
import { useStartAppointment, useCompleteAppointment, useMarkAsMissed, useCancelAppointment } from '../hooks/useAppointments.optimized';

// Components
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import FollowUpWidget from '../components/FollowUpWidget';
import StatusBadge from '../components/ui/StatusBadge';

// Utils
import { formatDate } from '../lib/utils';

const DashboardRateLimited = () => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalReason, setModalReason] = useState('');

  // Optimized data fetching with rate limiting
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading, 
    error: appointmentsError, 
    refetch: refetchAppointments 
  } = useTodayAppointments();

  const { 
    data: lowStockData, 
    isLoading: lowStockLoading, 
    error: lowStockError 
  } = useLowStockAlerts();

  const { 
    data: expiringData, 
    isLoading: expiringLoading, 
    error: expiringError 
  } = useExpiringMedicines(30);

  // Status mutations with rate limiting
  const startMutation = useStartAppointment();
  const completeMutation = useCompleteAppointment();
  const missMutation = useMarkAsMissed();
  const cancelMutation = useCancelAppointment();

  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Extract data
  const appointments = appointmentsData?.appointments || [];
  const lowStockMedicines = lowStockData?.data || [];
  const expiringMedicines = expiringData?.data || [];

  // Handle rate limiting errors
  useEffect(() => {
    const hasRateLimitError = [appointmentsError, lowStockError, expiringError].some(
      error => error?.response?.status === 429
    );
    
    if (hasRateLimitError) {
      setIsRateLimited(true);
      setRetryCount(prev => prev + 1);
    }
  }, [appointmentsError, lowStockError, expiringError]);

  // Auto-retry after rate limit
  useEffect(() => {
    if (isRateLimited && retryCount > 0) {
      const timer = setTimeout(() => {
        refetchAppointments();
        setIsRateLimited(false);
      }, 2000 * retryCount); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [isRateLimited, retryCount, refetchAppointments]);

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
        refetchAppointments();
        setShowStatusModal(false);
        setModalReason('');
        
        // Redirect to appointment detail page after starting
        if (action === 'start') {
          navigate(`/appointments/${appointmentId}`);
        }
      },
      onError: (error) => {
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait a moment and try again.');
        }
      }
    });
  };

  const getStatusActions = (status) => {
    const actions = {
      scheduled: [
        { label: 'Start', action: 'start', color: 'blue' },
        { label: 'Miss', action: 'miss', color: 'orange' },
        { label: 'Cancel', action: 'cancel', color: 'red' }
      ],
      in_progress: [
        { label: 'Complete', action: 'complete', color: 'green' },
        { label: 'Cancel', action: 'cancel', color: 'red' }
      ],
      completed: [],
      cancelled: [],
      missed: []
    };
    return actions[status] || [];
  };

  // Loading states with rate limiting handling
  const isAnyLoading = appointmentsLoading || lowStockLoading || expiringLoading;
  const hasAnyError = appointmentsError || lowStockError || expiringError;

  if (isAnyLoading && !isRateLimited) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isRateLimited) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Rate Limited</h3>
          <p className="mt-1 text-sm text-gray-500">
            Too many requests. Retrying in {retryCount * 2} seconds...
          </p>
          <Button 
            onClick={() => refetchAppointments()} 
            className="mt-4"
            variant="outline"
          >
            Retry Now
          </Button>
        </div>
      </div>
    );
  }

  if (hasAnyError && !isRateLimited) {
    return (
      <div className="p-8">
        <ErrorMessage 
          title="Failed to load dashboard" 
          message={appointmentsError?.message || 'An error occurred'}
          onRetry={() => refetchAppointments()}
        />
      </div>
    );
  }

  // Calculate stats
  const stats = [
    {
      name: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'In Progress',
      value: appointments.filter((a) => a.status === 'in_progress').length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Completed',
      value: appointments.filter((a) => a.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Patients Today',
      value: new Set(appointments.map((a) => a.patient_id)).size,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Rate Limiting Warning */}
      {isRateLimited && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Rate limited. Retrying automatically in {retryCount * 2} seconds...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/appointments/new')}
          className="inline-flex items-center"
          disabled={isRateLimited}
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center p-6">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Medicine Alerts - Load only if not rate limited */}
      {!isRateLimited && (lowStockMedicines.length > 0 || expiringMedicines.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {lowStockMedicines.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <CardTitle>Low Stock Alert</CardTitle>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {lowStockMedicines.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {lowStockMedicines.slice(0, 5).map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                        <p className="text-xs text-gray-500">
                          Stock: {medicine.quantity_stock} {medicine.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-red-600 font-medium">
                          {medicine.stock_percentage ? `${medicine.stock_percentage}%` : 'Critical'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiring Soon Alert */}
          {expiringMedicines.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-orange-500 mr-2" />
                    <CardTitle>Expiring Soon</CardTitle>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    {expiringMedicines.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {expiringMedicines.slice(0, 5).map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {formatDate(medicine.expiry_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-orange-600 font-medium">
                          {medicine.days_until_expiry} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Follow-up Widget - Load only if not rate limited */}
      {!isRateLimited && (
        <div className="mb-8">
          <FollowUpWidget />
        </div>
      )}

      {/* Today's Appointments with Status Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(new Date(), 'EEEE, MMM d, yyyy')}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/appointments/new')}
              className="inline-flex items-center"
              disabled={isRateLimited}
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments today"
              description="No appointments scheduled for today."
              action={{
                label: "Book Appointment",
                onClick: () => navigate('/appointments/new')
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.appointment_time?.slice(0, 5)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient_code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.patient_phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                disabled={isLoading || isRateLimited}
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
                Time: {selectedAppointment.appointment_time} - {selectedAppointment.appointment_date}
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

export default DashboardRateLimited;
