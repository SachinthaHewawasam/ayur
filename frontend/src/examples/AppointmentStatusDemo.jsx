import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import StatusBadge from '../components/ui/StatusBadge';
import AppointmentStatusManager from '../components/AppointmentStatusManager';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const AppointmentStatusDemo = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const { data: appointments, isLoading, error, refetch } = useAppointments();

  if (isLoading) {
    return <LoadingSpinner size="lg" className="flex justify-center py-8" />;
  }

  if (error) {
    return <ErrorMessage 
      title="Failed to load appointments" 
      message={error.message}
      onRetry={refetch}
    />;
  }

  const appointmentList = appointments?.appointments || [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Appointment Status Management</h2>
      
      <div className="grid gap-4">
        {appointmentList.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {appointment.patient_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {appointment.appointment_time} • {appointment.appointment_date}
                </p>
                <p className="text-sm text-gray-600">
                  Doctor: {appointment.doctor_name || 'Not assigned'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={appointment.status} showIcon />
              </div>
            </div>
            
            <div className="mt-4">
              <AppointmentStatusManager 
                appointment={appointment} 
                onStatusChange={refetch}
              />
            </div>
          </div>
        ))}
      </div>

      {appointmentList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No appointments found
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusDemo;
