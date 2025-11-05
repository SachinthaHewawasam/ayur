import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useState } from 'react';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch patient details
  const { data, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    },
  });

  // Fetch patient appointment history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['patient', id, 'history'],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}/history`);
      return response.data;
    },
  });

  const patient = data?.patient;
  const history = historyData?.history || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalVisits = history.length;
  const completedVisits = history.filter((h) => h.status === 'completed').length;
  const upcomingVisits = history.filter((h) => h.status === 'scheduled').length;

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/patients"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Patients
      </Link>

      {/* Patient Header Card */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{patient?.name}</h1>
              <p className="text-gray-600 mt-1">{patient?.patient_code}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {patient?.age} years, {patient?.gender}
                </span>
                {patient?.dosha_type && (
                  <span className="px-2 py-1 bg-ayur-leaf/20 text-ayur-leaf rounded-full text-xs font-medium capitalize">
                    {patient.dosha_type.replace('_', '-')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 md:mt-0">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
              <p className="text-xs text-gray-600">Total Visits</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedVisits}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{upcomingVisits}</p>
              <p className="text-xs text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="h-5 w-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-5 w-5 inline mr-2" />
              Visit History ({totalVisits})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Patient Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{patient?.phone}</p>
                </div>
              </div>

              {patient?.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              )}

              {patient?.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Registered On</p>
                  <p className="font-medium">
                    {new Date(patient?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {patient?.emergency_contact_name && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
                  <p className="font-medium">{patient.emergency_contact_name}</p>
                  <p className="text-sm text-gray-600">{patient.emergency_contact_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Health Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dosha Type</p>
                <p className="font-medium capitalize">
                  {patient?.dosha_type?.replace('_', '-') || 'Not assessed'}
                </p>
              </div>

              {patient?.allergies && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Allergies</p>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-gray-900">{patient.allergies}</p>
                  </div>
                </div>
              )}

              {patient?.medical_history && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Medical History</p>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{patient.medical_history}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visit history yet</h3>
              <p className="text-gray-600">
                This patient hasn't had any appointments or consultations yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visit History Timeline */}
              {history.map((visit, index) => (
                <div key={visit.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                          visit.status === 'completed'
                            ? 'bg-green-100'
                            : visit.status === 'scheduled'
                            ? 'bg-yellow-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Calendar
                          className={`h-6 w-6 ${
                            visit.status === 'completed'
                              ? 'text-green-600'
                              : visit.status === 'scheduled'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-bold text-gray-900">
                            {new Date(visit.appointment_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                          <span className="ml-3 flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {visit.appointment_time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          with {visit.doctor_name || 'Unknown Doctor'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(
                        visit.status
                      )}`}
                    >
                      {visit.status}
                    </span>
                  </div>

                  {/* Consultation Details */}
                  {visit.status === 'completed' && (
                    <div className="pl-16 space-y-4">
                      {visit.chief_complaint && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Chief Complaint</p>
                          <p className="text-gray-900">{visit.chief_complaint}</p>
                        </div>
                      )}

                      {visit.diagnosis && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis</p>
                          <p className="text-gray-900">{visit.diagnosis}</p>
                        </div>
                      )}

                      {visit.treatment_notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Treatment & Notes
                          </p>
                          <p className="text-gray-900 whitespace-pre-wrap">{visit.treatment_notes}</p>
                        </div>
                      )}

                      {/* Prescriptions */}
                      {visit.prescriptions && visit.prescriptions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Pill className="h-4 w-4 mr-1" />
                            Prescriptions ({visit.prescriptions.length})
                          </p>
                          <div className="space-y-2">
                            {visit.prescriptions.map((prescription, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                              >
                                <p className="font-medium text-gray-900">{prescription.medicine}</p>
                                <div className="mt-1 text-sm text-gray-600 space-y-1">
                                  <p>
                                    <span className="font-medium">Dosage:</span>{' '}
                                    {prescription.dosage}
                                  </p>
                                  <p>
                                    <span className="font-medium">Frequency:</span>{' '}
                                    {prescription.frequency}
                                  </p>
                                  <p>
                                    <span className="font-medium">Duration:</span>{' '}
                                    {prescription.duration_days} days
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {visit.followup_date && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Follow-up scheduled:</span>{' '}
                            {new Date(visit.followup_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* View Full Consultation Button */}
                      <div className="pt-3 border-t">
                        <button
                          onClick={() => navigate(`/appointments/${visit.id}`)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Full Consultation Details →
                        </button>
                      </div>
                    </div>
                  )}

                  {visit.status === 'scheduled' && (
                    <div className="pl-16">
                      {visit.chief_complaint && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Reason for Visit
                          </p>
                          <p className="text-gray-900">{visit.chief_complaint}</p>
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/appointments/${visit.id}`)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Start Consultation →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
