import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Calendar, Clock, User, Phone, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import AppointmentModal from '../components/AppointmentModal';

// Status Badge Component (matching Dashboard)
const StatusBadge = ({ status }) => {
  const statusStyles = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    missed: 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[status] || statusStyles.scheduled}`}>
      {status?.replace('_', ' ') || 'scheduled'}
    </span>
  );
};

export default function AppointmentsDashboardStyle() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['appointments', search, dateFilter, statusFilter],
    queryFn: async () => {
      const response = await api.get('/appointments', {
        params: { search, date: dateFilter, status: statusFilter },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const appointments = data?.appointments || [];

  // Calculate stats (matching Dashboard style)
  const stats = useMemo(() => {
    return [
      {
        name: 'Total',
        value: appointments.length,
        icon: Calendar,
        color: 'bg-blue-500'
      },
      {
        name: 'Scheduled',
        value: appointments.filter(a => a.status === 'scheduled').length,
        icon: Clock,
        color: 'bg-yellow-500'
      },
      {
        name: 'In Progress',
        value: appointments.filter(a => a.status === 'in_progress').length,
        icon: User,
        color: 'bg-blue-500'
      },
      {
        name: 'Completed',
        value: appointments.filter(a => a.status === 'completed').length,
        icon: Calendar,
        color: 'bg-green-500'
      }
    ];
  }, [appointments]);

  // Group by date
  const groupedAppointments = useMemo(() => {
    const grouped = {};
    appointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    });
    
    return grouped;
  }, [appointments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header (matching Dashboard) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all appointments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Stats Grid (matching Dashboard) */}
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

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Appointments List (matching Dashboard style) */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No appointments found</h3>
          <p className="text-xs text-gray-500 mb-4">Get started by booking your first appointment</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date} className="bg-white rounded-xl border border-gray-100">
              {/* Date Header (matching Dashboard) */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{formatDate(date)}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointments (matching Dashboard style) */}
              <div className="p-6">
                <div className="space-y-3">
                  {dateAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Time & Patient Info (matching Dashboard) */}
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
                              {appointment.patient_phone && (
                                <p className="text-xs text-gray-600">{appointment.patient_phone}</p>
                              )}
                              {appointment.doctor_name && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <p className="text-xs text-gray-600">Dr. {appointment.doctor_name}</p>
                                </>
                              )}
                            </div>
                            {appointment.chief_complaint && (
                              <p className="text-xs text-gray-500 mt-1">{appointment.chief_complaint}</p>
                            )}
                          </div>
                        </div>
                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
