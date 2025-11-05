import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Clock, Plus, AlertTriangle, Package } from 'lucide-react';
import { format } from 'date-fns';

// Hooks
import { useTodayAppointments, useFollowUps } from '../hooks/useAppointments';
import { useLowStockAlerts, useExpiringMedicines } from '../hooks/useMedicines';

// Components
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import FollowUpWidget from '../components/FollowUpWidget';
import AppointmentModal from '../components/AppointmentModal';

// Utils
import { formatDate, getStatusColor } from '../lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();

  // Data fetching with hooks
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
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

  // Extract data safely
  const appointments = appointmentsData?.appointments || [];
  const lowStockMedicines = lowStockData?.data || [];
  const expiringMedicines = expiringData?.data || [];

  // Calculate statistics
  const stats = [
    {
      name: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Completed',
      value: appointments.filter((a) => a.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Scheduled',
      value: appointments.filter((a) => a.status === 'scheduled').length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Patients Today',
      value: new Set(appointments.map((a) => a.patient_id)).size,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  // Loading states
  if (appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error states
  if (appointmentsError) {
    return (
      <div className="p-8">
        <ErrorMessage 
          title="Failed to load dashboard" 
          message={appointmentsError.message}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
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

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
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
              {lowStockMedicines.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate('/medicines?low_stock=true')}
                >
                  View All
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Expiring Medicines */}
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
              {expiringMedicines.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate('/medicines')}
                >
                  View All
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Follow-ups Widget */}
      <FollowUpWidget />

      {/* Today's Appointments */}
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
                      Complaint
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
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
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {appointment.chief_complaint || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
