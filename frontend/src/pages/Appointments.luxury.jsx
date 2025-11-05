import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Plus, Filter, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, Users, Activity,
  ChevronRight, Phone, MapPin
} from 'lucide-react';
import api from '../services/api';
import AppointmentModal from '../components/AppointmentModal';
import { 
  LuxuryCard, 
  LuxuryStatsCard, 
  LuxurySearchBar, 
  LuxuryButton, 
  LuxuryBadge,
  LuxuryEmptyState,
  LuxurySkeleton
} from '../components/ui/LuxuryComponents';

export default function AppointmentsLuxury() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'grid'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['appointments', dateFilter, statusFilter],
    queryFn: async () => {
      const response = await api.get('/appointments', {
        params: { date: dateFilter, status: statusFilter },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const appointments = data?.appointments || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const inProgress = appointments.filter(a => a.status === 'in_progress').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    return { total, scheduled, completed, inProgress, cancelled };
  }, [appointments]);

  // Group appointments by date for timeline
  const groupedAppointments = useMemo(() => {
    const grouped = {};
    appointments.forEach(apt => {
      const date = apt.appointment_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(apt);
    });
    
    // Sort appointments within each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    });
    
    return grouped;
  }, [appointments]);

  const getStatusVariant = (status) => {
    const variants = {
      scheduled: 'warning',
      in_progress: 'primary',
      completed: 'success',
      cancelled: 'danger',
      missed: 'default'
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: Clock,
      in_progress: Activity,
      completed: CheckCircle,
      cancelled: XCircle,
      missed: AlertCircle
    };
    return icons[status] || Clock;
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} • Manage your schedule
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <LuxuryButton onClick={() => setIsModalOpen(true)} icon={Plus}>
            Book Appointment
          </LuxuryButton>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LuxuryStatsCard
          icon={Calendar}
          label="Total"
          value={stats.total}
          gradient="from-blue-50 to-indigo-50"
          iconColor="text-blue-600"
        />
        <LuxuryStatsCard
          icon={Clock}
          label="Scheduled"
          value={stats.scheduled}
          gradient="from-orange-50 to-amber-50"
          iconColor="text-orange-600"
        />
        <LuxuryStatsCard
          icon={Activity}
          label="In Progress"
          value={stats.inProgress}
          gradient="from-purple-50 to-pink-50"
          iconColor="text-purple-600"
        />
        <LuxuryStatsCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completed}
          trend="up"
          trendValue="+8%"
          gradient="from-green-50 to-emerald-50"
          iconColor="text-green-600"
        />
        <LuxuryStatsCard
          icon={XCircle}
          label="Cancelled"
          value={stats.cancelled}
          gradient="from-red-50 to-rose-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Filters */}
      <LuxuryCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="missed">Missed</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-3 rounded-xl transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </LuxuryCard>

      {/* Appointments Display */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <LuxuryCard key={i}>
              <LuxurySkeleton count={2} />
            </LuxuryCard>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <LuxuryCard>
          <LuxuryEmptyState
            icon={Calendar}
            title="No appointments found"
            description={dateFilter || statusFilter ? 'Try adjusting your filters' : 'Get started by booking your first appointment'}
            action={!dateFilter && !statusFilter ? {
              label: 'Book Appointment',
              onClick: () => setIsModalOpen(true),
              icon: Plus
            } : undefined}
          />
        </LuxuryCard>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="space-y-8">
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{formatDate(date)}</h3>
                  <p className="text-sm text-gray-500">{dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
                {dateAppointments.map((apt, index) => {
                  const StatusIcon = getStatusIcon(apt.status);
                  const endTime = new Date(`2000-01-01T${apt.appointment_time}`);
                  endTime.setMinutes(endTime.getMinutes() + (apt.duration_minutes || 30));
                  
                  return (
                    <div key={apt.id} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[29px] top-6">
                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                          apt.status === 'completed' ? 'bg-green-500' :
                          apt.status === 'in_progress' ? 'bg-blue-500' :
                          apt.status === 'scheduled' ? 'bg-orange-500' :
                          apt.status === 'cancelled' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                      </div>

                      {/* Appointment Card */}
                      <LuxuryCard 
                        className="cursor-pointer group"
                        onClick={() => navigate(`/appointments/${apt.id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Time & Status */}
                          <div className="flex-shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-bold text-gray-900">
                                {apt.appointment_time?.slice(0, 5)}
                              </span>
                              <span className="text-xs text-gray-400">→</span>
                              <span className="text-xs text-gray-600">
                                {endTime.toTimeString().slice(0, 5)}
                              </span>
                            </div>
                            <LuxuryBadge variant={getStatusVariant(apt.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {apt.status.replace('_', ' ').toUpperCase()}
                            </LuxuryBadge>
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                              {apt.patient_name}
                            </h4>
                            {apt.chief_complaint && (
                              <p className="text-sm text-gray-600 mb-2">{apt.chief_complaint}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {apt.patient_code}
                              </div>
                              {apt.patient_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {apt.patient_phone}
                                </div>
                              )}
                              {apt.doctor_name && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  Dr. {apt.doctor_name}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </LuxuryCard>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt) => {
            const StatusIcon = getStatusIcon(apt.status);
            const endTime = new Date(`2000-01-01T${apt.appointment_time}`);
            endTime.setMinutes(endTime.getMinutes() + (apt.duration_minutes || 30));
            
            return (
              <Link key={apt.id} to={`/appointments/${apt.id}`}>
                <LuxuryCard className="group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        apt.status === 'completed' ? 'bg-green-100' :
                        apt.status === 'in_progress' ? 'bg-blue-100' :
                        apt.status === 'scheduled' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${
                          apt.status === 'completed' ? 'text-green-600' :
                          apt.status === 'in_progress' ? 'text-blue-600' :
                          apt.status === 'scheduled' ? 'text-orange-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <LuxuryBadge variant={getStatusVariant(apt.status)}>
                      {apt.status.replace('_', ' ').toUpperCase()}
                    </LuxuryBadge>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {apt.patient_name}
                  </h4>

                  {apt.chief_complaint && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{apt.chief_complaint}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(apt.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {apt.appointment_time?.slice(0, 5)} - {endTime.toTimeString().slice(0, 5)}
                    </div>
                    {apt.doctor_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        Dr. {apt.doctor_name}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{apt.patient_code}</span>
                      <span>{apt.duration_minutes || 30} min</span>
                    </div>
                  </div>
                </LuxuryCard>
              </Link>
            );
          })}
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
