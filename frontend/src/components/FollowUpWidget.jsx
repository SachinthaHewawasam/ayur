import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Phone, Mail, User, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function FollowUpWidget() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, today, upcoming, overdue
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['followups', 'upcoming', filter],
    queryFn: async () => {
      const response = await api.get('/appointments/followups/upcoming', {
        params: {
          status: filter,
          days: 7
        }
      });
      return response.data;
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    retry: 2
  });

  const followups = data?.followups || [];

  const getStatusBadge = (followup) => {
    const daysOverdue = parseInt(followup.days_overdue);
    const followupDate = new Date(followup.followup_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (daysOverdue > 0) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Overdue ({daysOverdue} days)
        </span>
      );
    } else if (followupDate.toDateString() === today.toDateString()) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          Today
        </span>
      );
    } else {
      const daysUntil = Math.ceil((followupDate - today) / (1000 * 60 * 60 * 24));
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
        </span>
      );
    }
  };

  const handleBookAppointment = (followup) => {
    navigate('/appointments', {
      state: {
        patientId: followup.patient_id,
        patientName: followup.patient_name,
        prefillFromFollowup: true
      }
    });
  };

  // Get preview info for collapsed state
  const getPreviewInfo = () => {
    if (followups.length === 0) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = followups.filter(f => {
      const followupDate = new Date(f.followup_date);
      followupDate.setHours(0, 0, 0, 0);
      return followupDate.toDateString() === today.toDateString();
    }).length;
    
    const overdueCount = followups.filter(f => parseInt(f.days_overdue) > 0).length;
    
    const nextFollowup = followups[0]; // Already sorted by date
    
    return { todayCount, overdueCount, nextFollowup };
  };

  const previewInfo = getPreviewInfo();

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</h2>
          </div>
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
            {followups.length}
          </span>
        </div>

        {/* Preview Hint when collapsed */}
        {!isExpanded && previewInfo && (
          <div className="flex items-center gap-3 mr-3">
            {previewInfo.overdueCount > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                {previewInfo.overdueCount} overdue
              </span>
            )}
            {previewInfo.todayCount > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {previewInfo.todayCount} today
              </span>
            )}
            {previewInfo.nextFollowup && (
              <span className="text-xs text-gray-600">
                Next: {previewInfo.nextFollowup.patient_name} - {new Date(previewInfo.nextFollowup.followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        )}

        {/* Expand/Collapse Icon */}
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <>
          <div className="px-6 pb-3 border-b border-gray-100">
            {/* Filter Tabs - Minimalistic */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'today'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'overdue'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : followups.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-700">No follow-ups</h3>
            <p className="mt-1 text-xs text-gray-500">
              {filter === 'all'
                ? 'No upcoming follow-ups scheduled'
                : `No ${filter} follow-ups`}
            </p>
          </div>
        ) : (
          followups.map((followup, index) => (
            <div key={followup.appointment_id || `followup-${followup.patient_id}-${index}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Patient Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to={`/patients/${followup.patient_id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate"
                    >
                      {followup.patient_name}
                    </Link>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{followup.patient_code}</span>
                    {getStatusBadge(followup)}
                  </div>

                  {/* Compact Details */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <span>{followup.age}y, {followup.gender}</span>
                    {followup.doctor_name && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>Dr. {followup.doctor_name}</span>
                      </>
                    )}
                  </div>

                  {followup.chief_complaint && (
                    <p className="text-xs text-gray-600 mb-2 truncate">
                      {followup.chief_complaint}
                    </p>
                  )}

                  {/* Contact & Date */}
                  <div className="flex items-center gap-3 text-xs">
                    <a href={`tel:${followup.patient_phone}`} className="text-blue-600 hover:text-blue-700">
                      {followup.patient_phone}
                    </a>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      {new Date(followup.followup_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleBookAppointment(followup)}
                  className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                >
                  Book
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {followups.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <Link
            to="/appointments"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View all appointments →
          </Link>
        </div>
      )}
        </>
      )}
    </div>
  );
}
