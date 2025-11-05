import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Clock, Plus, AlertTriangle, Package } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentModal from '../components/AppointmentModal';

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
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

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
          onClick={() => setShowAppointmentModal(true)}
          className="inline-flex items-center"
          disabled={isRateLimited}
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Stats Grid - Minimalistic */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg bg-opacity-10`}>
                  <Icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts Section - Minimalistic */}
      {!isRateLimited && (lowStockMedicines.length > 0 || expiringMedicines.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Low Stock Alert */}
          {lowStockMedicines.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-900">Low Stock</h3>
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  {lowStockMedicines.length}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lowStockMedicines.slice(0, 3).map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-xs">{medicine.name}</p>
                      <p className="text-xs text-gray-500">{medicine.quantity_stock} {medicine.unit}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-600">
                      {medicine.stock_percentage ? `${medicine.stock_percentage}%` : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Soon Alert */}
          {expiringMedicines.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <h3 className="text-sm font-semibold text-orange-900">Expiring Soon</h3>
                </div>
                <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  {expiringMedicines.length}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {expiringMedicines.slice(0, 3).map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-xs">{medicine.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(medicine.expiry_date)}</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">
                      {medicine.days_until_expiry}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Widget - Minimalistic */}
      {!isRateLimited && <FollowUpWidget />}

      {/* Today's Appointments - Minimalistic */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(new Date(), 'EEEE, MMM d, yyyy')}
              </p>
            </div>
            <Button 
              onClick={() => setShowAppointmentModal(true)}
              className="inline-flex items-center text-sm"
              disabled={isRateLimited}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>
        <div className="p-6">
          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments today"
              description="No appointments scheduled for today."
              action={{
                label: "Book Appointment",
                onClick: () => setShowAppointmentModal(true)
              }}
            />
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const actions = getStatusActions(appointment.status);
                const isLoading = startMutation.isLoading || 
                                completeMutation.isLoading || 
                                missMutation.isLoading || 
                                cancelMutation.isLoading;

                return (
                  <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* Time & Patient Info */}
                      <div className="flex gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="text-sm font-bold text-gray-900">
                            {appointment.appointment_time?.slice(0, 5)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            <StatusBadge status={appointment.status} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {appointment.patient_name}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{appointment.patient_code}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-600">{appointment.patient_phone}</p>
                            {appointment.doctor_name && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <p className="text-xs text-gray-600">Dr. {appointment.doctor_name}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        {actions.map((action) => (
                          <Button
                            key={action.action}
                            onClick={() => handleStatusAction(appointment, action.action)}
                            disabled={isLoading || isRateLimited}
                            variant={action.color}
                            size="sm"
                            className="text-xs px-3 py-1.5"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSuccess={() => {
          setShowAppointmentModal(false);
          refetchAppointments();
        }}
        initialDate={new Date()} // Set today's date as default
      />
    </div>
  );
};

export default DashboardRateLimited;
