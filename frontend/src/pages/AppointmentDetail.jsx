import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, User, Calendar, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const consultationSchema = Yup.object({
  chief_complaint: Yup.string(),
  diagnosis: Yup.string(),
  treatment_notes: Yup.string(),
  followup_date: Yup.date(),
});

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);

  // Fetch appointment details
  const { data, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 1, // Only retry once on failure
  });

  const appointment = data?.appointment;

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const response = await api.put(`/appointments/${id}`, values);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Update response:', data);
      toast.success('Consultation updated successfully');
      // Update the cache with the new data to preserve followup_date
      queryClient.setQueryData(['appointment', id], data);
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['followups']);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update consultation');
    },
  });

  // Patient update mutation
  const updatePatientMutation = useMutation({
    mutationFn: async (values) => {
      const response = await api.put(`/patients/${appointment.patient_id}`, values);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Patient information updated successfully');
      // Update the patient data in the appointment cache
      // The appointment object has patient fields directly (not nested)
      queryClient.setQueryData(['appointment', id], (old) => ({
        ...old,
        appointment: {
          ...old.appointment,
          allergies: data.patient.allergies,
          medical_history: data.patient.medical_history,
          dosha_type: data.patient.dosha_type,
        }
      }));
      queryClient.invalidateQueries(['patient', appointment.patient_id]);
      setIsEditingPatient(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    },
  });

  // Consultation form
  const consultationForm = useFormik({
    initialValues: {
      chief_complaint: appointment?.chief_complaint || '',
      diagnosis: appointment?.diagnosis || '',
      treatment_notes: appointment?.treatment_notes || '',
      followup_date: formatDateForInput(appointment?.followup_date),
      status: appointment?.status || 'scheduled',
    },
    validationSchema: consultationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateMutation.mutateAsync(values);
    },
  });

  // Patient update form
  const patientForm = useFormik({
    initialValues: {
      allergies: appointment?.allergies || '',
      medical_history: appointment?.medical_history || '',
      dosha_type: appointment?.dosha_type || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updatePatientMutation.mutateAsync(values);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600">Appointment not found</p>
        <Link to="/appointments" className="mt-4 text-primary-600 hover:text-primary-700">
          ← Back to Appointments
        </Link>
      </div>
    );
  }

  const handleCompleteConsultation = async () => {
    await consultationForm.setFieldValue('status', 'completed');
    await consultationForm.submitForm();
  };

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/appointments"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Appointments
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation Details</h1>
          <p className="text-gray-600 mt-1">
            {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
            {appointment.appointment_time}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Consultation'}
          </button>
          {appointment.status !== 'completed' && (
            <button
              onClick={handleCompleteConsultation}
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              Complete Consultation
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {appointment.patient_name}
                </h2>
                <p className="text-gray-600">{appointment.patient_code}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{appointment.patient_phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Doctor</p>
                <p className="font-medium">{appointment.doctor_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    appointment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link
                to={`/patients/${appointment.patient_id}`}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View Full Patient Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Consultation Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultation Form */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Consultation Notes
            </h3>

            <form onSubmit={consultationForm.handleSubmit} className="space-y-4">
              {/* Chief Complaint */}
              <div>
                <label htmlFor="chief_complaint" className="label">
                  Chief Complaint
                </label>
                <textarea
                  id="chief_complaint"
                  rows="2"
                  className="input"
                  disabled={!isEditing}
                  {...consultationForm.getFieldProps('chief_complaint')}
                ></textarea>
              </div>

              {/* Diagnosis */}
              <div>
                <label htmlFor="diagnosis" className="label">
                  Diagnosis
                </label>
                <textarea
                  id="diagnosis"
                  rows="3"
                  className="input"
                  disabled={!isEditing}
                  {...consultationForm.getFieldProps('diagnosis')}
                ></textarea>
              </div>

              {/* Treatment Notes */}
              <div>
                <label htmlFor="treatment_notes" className="label">
                  Treatment Plan & Notes
                </label>
                <textarea
                  id="treatment_notes"
                  rows="4"
                  className="input"
                  placeholder="Document treatment recommendations, lifestyle advice, dietary changes..."
                  disabled={!isEditing}
                  {...consultationForm.getFieldProps('treatment_notes')}
                ></textarea>
              </div>

              {/* Follow-up Date */}
              <div>
                <label htmlFor="followup_date" className="label">
                  Follow-up Date
                </label>
                <input
                  id="followup_date"
                  type="date"
                  className="input"
                  disabled={!isEditing}
                  {...consultationForm.getFieldProps('followup_date')}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={consultationForm.isSubmitting}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {consultationForm.isSubmitting ? 'Saving...' : 'Save Consultation'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Patient Health Update */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Update Patient Health Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingPatient(!isEditingPatient)}
                className="btn btn-secondary btn-sm"
              >
                {isEditingPatient ? 'Cancel' : 'Edit Patient Info'}
              </button>
            </div>

            <form onSubmit={patientForm.handleSubmit} className="space-y-4">
              {/* Dosha Type */}
              <div>
                <label htmlFor="dosha_type" className="label">
                  Dosha Type
                </label>
                <select
                  id="dosha_type"
                  className="input"
                  disabled={!isEditingPatient}
                  {...patientForm.getFieldProps('dosha_type')}
                >
                  <option value="">Select dosha type</option>
                  <option value="vata">Vata</option>
                  <option value="pitta">Pitta</option>
                  <option value="kapha">Kapha</option>
                  <option value="vata_pitta">Vata-Pitta</option>
                  <option value="pitta_kapha">Pitta-Kapha</option>
                  <option value="vata_kapha">Vata-Kapha</option>
                  <option value="tridosha">Tridosha</option>
                </select>
              </div>

              {/* Allergies */}
              <div>
                <label htmlFor="allergies" className="label">
                  Allergies
                </label>
                <textarea
                  id="allergies"
                  rows="2"
                  className="input"
                  placeholder="Update any new allergies discovered..."
                  disabled={!isEditingPatient}
                  {...patientForm.getFieldProps('allergies')}
                ></textarea>
              </div>

              {/* Medical History Update */}
              <div>
                <label htmlFor="medical_history" className="label">
                  Medical History
                </label>
                <textarea
                  id="medical_history"
                  rows="3"
                  className="input"
                  placeholder="Add new findings, conditions, or update existing history..."
                  disabled={!isEditingPatient}
                  {...patientForm.getFieldProps('medical_history')}
                ></textarea>
              </div>

              {isEditingPatient && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={patientForm.isSubmitting}
                    className="btn btn-primary"
                  >
                    {patientForm.isSubmitting
                      ? 'Updating...'
                      : 'Update Patient Information'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Prescriptions Section - Placeholder */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Prescriptions</h3>
            {appointment.prescriptions && appointment.prescriptions.length > 0 ? (
              <div className="space-y-2">
                {appointment.prescriptions.map((prescription, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{prescription.medicine_name}</p>
                      <p className="text-sm text-gray-600">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                      <p className="text-sm text-gray-600">
                        Duration: {prescription.duration_days} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No prescriptions added yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
