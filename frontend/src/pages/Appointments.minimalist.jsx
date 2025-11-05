import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Calendar, Clock, User, 
  CheckCircle, XCircle, AlertCircle, Activity,
  Phone, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import AppointmentModal from '../components/AppointmentModal';

export default function AppointmentsMinimalist() {
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

  // Calculate stats
  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const inProgress = appointments.filter(a => a.status === 'in_progress').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    
    return { total, scheduled, inProgress, completed };
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

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-amber-50 text-amber-700',
      in_progress: 'bg-blue-50 text-blue-700',
      completed: 'bg-emerald-50 text-emerald-700',
      cancelled: 'bg-rose-50 text-rose-700',
      missed: 'bg-gray-50 text-gray-700'
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: Clock,
      in_progress: Activity,
      completed: CheckCircle,
      cancelled: XCircle,
      missed: AlertCircle
    };
    const Icon = icons[status] || Clock;
    return Icon;
  };

  const getTimelineDotColor = (status) => {
    const colors = {
      scheduled: 'bg-amber-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-emerald-500',
      cancelled: 'bg-rose-500',
      missed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalist Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">Appointments</h1>
              <p className="text-sm text-gray-500 mt-1">Schedule and manage appointments</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              New Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Minimalist Stats */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-3xl font-light text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Scheduled</p>
            <p className="text-3xl font-light text-amber-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">In Progress</p>
            <p className="text-3xl font-light text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-3xl font-light text-emerald-600">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search appointments..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
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

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by booking your first appointment</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{formatDate(date)}</h3>
                    <p className="text-sm text-gray-500">{dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative ml-6 border-l-2 border-gray-100 pl-8 space-y-6">
                  {dateAppointments.map((apt, index) => {
                    const StatusIcon = getStatusIcon(apt.status);
                    const endTime = new Date(`2000-01-01T${apt.appointment_time}`);
                    endTime.setMinutes(endTime.getMinutes() + (apt.duration_minutes || 30));
                    
                    return (
                      <div key={apt.id} className="relative">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[37px] top-6 w-4 h-4 rounded-full border-2 border-white shadow-md ${getTimelineDotColor(apt.status)}`}></div>

                        {/* Appointment Card */}
                        <div
                          onClick={() => navigate(`/appointments/${apt.id}`)}
                          className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-6">
                            {/* Time & Status */}
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-base font-medium text-gray-900">
                                  {apt.appointment_time?.slice(0, 5)}
                                </span>
                                <span className="text-sm text-gray-400">→</span>
                                <span className="text-sm text-gray-600">
                                  {endTime.toTimeString().slice(0, 5)}
                                </span>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${getStatusColor(apt.status)}`}>
                                <StatusIcon className="h-3 w-3" />
                                {apt.status.replace('_', ' ')}
                              </span>
                            </div>

                            {/* Patient Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                                {apt.patient_name}
                              </h4>
                              
                              {apt.chief_complaint && (
                                <p className="text-sm text-gray-600 mb-3">{apt.chief_complaint}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-4 w-4" />
                                  {apt.patient_code}
                                </div>
                                {apt.patient_phone && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="h-4 w-4" />
                                      {apt.patient_phone}
                                    </div>
                                  </>
                                )}
                                {apt.doctor_name && (
                                  <>
                                    <span>•</span>
                                    <span>Dr. {apt.doctor_name}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
