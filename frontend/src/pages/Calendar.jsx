import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Calendar as CalendarIcon, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar-custom.css';
import api from '../services/api';
import AppointmentModal from '../components/AppointmentModal';

// Setup the localizer for react-big-calendar
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate date range for API query
  const startDate = view === 'month'
    ? format(startOfMonth(currentDate), 'yyyy-MM-dd')
    : view === 'week'
    ? format(addDays(startOfWeek(currentDate), -7), 'yyyy-MM-dd')
    : format(currentDate, 'yyyy-MM-dd');

  const endDate = view === 'month'
    ? format(endOfMonth(currentDate), 'yyyy-MM-dd')
    : view === 'week'
    ? format(addDays(startOfWeek(currentDate), 14), 'yyyy-MM-dd')
    : format(addDays(currentDate, 1), 'yyyy-MM-dd');

  // Fetch appointments for the current view
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['appointments', 'calendar', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/appointments', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    },
  });

  const appointments = data?.appointments || [];

  // Calculate stats for the current view
  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const missed = appointments.filter(a => a.status === 'missed').length;
    
    return { total, scheduled, completed, cancelled, missed };
  }, [appointments]);

  // Transform appointments to calendar events
  const events = appointments.map((apt) => {
    const date = new Date(apt.appointment_date);
    const [hours, minutes] = apt.appointment_time.split(':');
    const start = new Date(date);
    start.setHours(parseInt(hours), parseInt(minutes), 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + (apt.duration_minutes || 30));

    return {
      id: apt.id,
      title: `${apt.patient_name}${apt.chief_complaint ? ` - ${apt.chief_complaint}` : ''}`,
      start,
      end,
      resource: apt, // Store full appointment data
    };
  });

  // Event style getter for color coding
  const eventStyleGetter = (event) => {
    const status = event.resource.status;
    let backgroundColor = '#3B82F6'; // blue default

    switch (status) {
      case 'completed':
        backgroundColor = '#10B981'; // green
        break;
      case 'scheduled':
        backgroundColor = '#F59E0B'; // yellow/orange
        break;
      case 'cancelled':
        backgroundColor = '#EF4444'; // red
        break;
      case 'missed':
        backgroundColor = '#6B7280'; // gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 5px',
      },
    };
  };

  // Handle event click
  const handleSelectEvent = (event) => {
    navigate(`/appointments/${event.id}`);
  };

  // Handle slot selection (clicking on empty calendar slot)
  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setIsModalOpen(true);
  };

  // Export calendar as iCal
  const handleExportCalendar = async () => {
    try {
      const response = await api.get('/appointments/export/ical', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acms-appointments-${format(new Date(), 'yyyy-MM-dd')}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-600 mt-1">
            {format(currentDate, 'MMMM yyyy')} • {stats.total} appointment{stats.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={handleExportCalendar}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export to iCal format"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-600">{stats.scheduled}</span>
          </div>
          <p className="text-xs text-gray-600">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
          </div>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-red-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-red-600">{stats.cancelled}</span>
          </div>
          <p className="text-xs text-gray-600">Cancelled</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-5 w-5 text-gray-500" />
            <span className="text-2xl font-bold text-gray-600">{stats.missed}</span>
          </div>
          <p className="text-xs text-gray-600">Missed</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-gray-600">Missed</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">Click on any appointment to view details</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          step={15}
          timeslots={4}
          min={new Date(2024, 0, 1, 8, 0, 0)} // 8 AM
          max={new Date(2024, 0, 1, 20, 0, 0)} // 8 PM
          style={{ height: '100%' }}
          popup
          messages={{
            today: 'Today',
            previous: '← Previous',
            next: 'Next →',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Appointment',
            noEventsInRange: 'No appointments in this time range.',
            showMore: (total) => `+${total} more`,
          }}
        />
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1 text-sm">
              Sync with Your Personal Calendar
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Export appointments to Google Calendar, Outlook, Apple Calendar, or any iCal-compatible app. 
              Click an appointment to view details or click empty slots to book new appointments.
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
          refetch();
        }}
        initialDate={selectedDate}
      />
    </div>
  );
}
