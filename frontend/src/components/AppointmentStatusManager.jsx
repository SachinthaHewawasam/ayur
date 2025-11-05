import { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, Flag } from 'lucide-react';
import Button from './ui/Button';
import { useStatusRules, useStartAppointment, useCompleteAppointment, useMarkAsMissed, useCancelAppointment } from '../hooks/useAppointments';
import { format } from 'date-fns';

const AppointmentStatusManager = ({ appointment, onStatusChange }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Hooks for status management
  const { data: statusRules } = useStatusRules(appointment?.id);
  const startMutation = useStartAppointment();
  const completeMutation = useCompleteAppointment();
  const missMutation = useMarkAsMissed();
  const cancelMutation = useCancelAppointment();

  const statusConfig = {
    scheduled: {
      label: 'Scheduled',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
      actions: ['start', 'cancel', 'miss']
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Play,
      actions: ['complete', 'cancel']
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      actions: []
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      actions: ['reschedule']
    },
    missed: {
      label: 'Missed',
      color: 'bg-orange-100 text-orange-800',
      icon: AlertCircle,
      actions: ['reschedule']
    }
  };

  const currentStatus = appointment?.status;
  const config = statusConfig[currentStatus] || statusConfig.scheduled;
  const Icon = config.icon;

  const handleStatusChange = (action) => {
    if (action === 'miss' || action === 'cancel') {
      setPendingAction(action);
      setShowReasonModal(true);
      return;
    }

    executeStatusChange(action);
  };

  const executeStatusChange = (action, reasonText = '') => {
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
      params = appointment.id; // Just the ID
    } else if (action === 'complete') {
      params = { id: appointment.id, data: { reason: reasonText } };
    } else if (action === 'miss' || action === 'cancel') {
      params = { id: appointment.id, reason: reasonText };
    }

    mutation.mutate(params, {
      onSuccess: () => {
        onStatusChange?.();
        setShowReasonModal(false);
        setReason('');
        setPendingAction(null);
      }
    });
  };

  const isActionDisabled = (action) => {
    const isLoading = startMutation.isLoading || completeMutation.isLoading || 
                     missMutation.isLoading || cancelMutation.isLoading;
    return isLoading;
  };

  const getButtonConfig = (action) => {
    const configs = {
      start: { label: 'Start', variant: 'primary', icon: Play },
      complete: { label: 'Complete', variant: 'success', icon: CheckCircle },
      miss: { label: 'Mark Missed', variant: 'warning', icon: Flag },
      cancel: { label: 'Cancel', variant: 'danger', icon: XCircle },
      reschedule: { label: 'Reschedule', variant: 'secondary', icon: Clock }
    };
    return configs[action];
  };

  const allowedActions = statusRules?.rules?.allowed || [];

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4" />
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Action Buttons */}
      {allowedActions.length > 0 && (
        <div className="flex space-x-2">
          {allowedActions.map((action) => {
            const buttonConfig = getButtonConfig(action);
            if (!buttonConfig) return null;
            
            const ButtonIcon = buttonConfig.icon;
            
            return (
              <Button
                key={action}
                onClick={() => handleStatusChange(action)}
                disabled={isActionDisabled(action)}
                variant={buttonConfig.variant}
                size="sm"
                className="inline-flex items-center"
              >
                <ButtonIcon className="h-3 w-3 mr-1" />
                {buttonConfig.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {pendingAction === 'cancel' ? 'Cancel Appointment' : 'Mark as Missed'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={pendingAction === 'cancel' 
                  ? 'Enter cancellation reason...' 
                  : 'Enter reason for missing...'
                }
              />
            </div>

            <div className="flex space-x-3 justify-end">
              <Button
                onClick={() => {
                  setShowReasonModal(false);
                  setReason('');
                  setPendingAction(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => executeStatusChange(pendingAction, reason)}
                disabled={
                  pendingAction === 'cancel' ? cancelMutation.isLoading : missMutation.isLoading
                }
                variant={pendingAction === 'cancel' ? 'danger' : 'warning'}
                size="sm"
              >
                {pendingAction === 'cancel' ? 'Cancel Appointment' : 'Mark as Missed'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusManager;
