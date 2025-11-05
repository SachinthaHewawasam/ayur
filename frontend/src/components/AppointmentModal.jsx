import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, Search, Plus, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const appointmentSchema = Yup.object({
  patient_id: Yup.number().required('Patient is required'),
  doctor_id: Yup.number().required('Doctor is required'),
  appointment_date: Yup.date().required('Date is required'),
  appointment_time: Yup.string().required('Time is required'),
  duration_minutes: Yup.number().min(15).max(180),
  chief_complaint: Yup.string(),
});

const quickPatientSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  age: Yup.number().min(0).max(150).required('Age is required'),
  gender: Yup.string().required('Gender is required'),
});

export default function AppointmentModal({ isOpen, onClose, onSuccess, initialDate = null }) {
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const queryClient = useQueryClient();

  // Fetch today's appointments to show booked times
  const { data: todayAppointmentsData } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const response = await api.get('/appointments/today');
      return response.data;
    },
    enabled: isOpen,
  });

  const todayAppointments = todayAppointmentsData?.appointments || [];

  // Fetch patients for search
  const { data: patientsData } = useQuery({
    queryKey: ['patients', patientSearch],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2) return { patients: [] };
      const response = await api.get('/patients', {
        params: { search: patientSearch, limit: 10 },
      });
      return response.data;
    },
    enabled: !showNewPatient,
  });

  // Fetch all doctors
  const { data: doctorsData } = useQuery({
    queryKey: ['users', 'doctors'],
    queryFn: async () => {
      const response = await api.get('/users');
      // Filter only doctors and admins (who can also handle appointments)
      const doctors = response.data.users.filter(
        user => user.role === 'doctor' || user.role === 'admin'
      );
      return { doctors };
    },
  });

  const patients = patientsData?.patients || [];
  const doctors = doctorsData?.doctors || [];

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (values) => {
      const response = await api.post('/appointments', {
        ...values,
        appointment_time: `${values.appointment_time}:00`,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Appointment booked successfully');
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['appointments', 'today']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    },
  });

  // Quick patient registration mutation
  const createPatientMutation = useMutation({
    mutationFn: async (values) => {
      const response = await api.post('/patients', values);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Patient registered successfully');
      setSelectedPatient(data.patient);
      appointmentForm.setFieldValue('patient_id', data.patient.id);
      setShowNewPatient(false);
      queryClient.invalidateQueries(['patients']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    },
  });

  // Appointment form
  const appointmentForm = useFormik({
    initialValues: {
      patient_id: '',
      doctor_id: doctors[0]?.id || '',
      appointment_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
      appointment_time: initialDate ? format(initialDate, 'HH:mm') : '',
      duration_minutes: 30,
      chief_complaint: '',
    },
    validationSchema: appointmentSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await createAppointmentMutation.mutateAsync(values);
    },
  });

  // Quick patient form
  const patientForm = useFormik({
    initialValues: {
      name: '',
      phone: '',
      age: '',
      gender: '',
    },
    validationSchema: quickPatientSchema,
    onSubmit: async (values) => {
      await createPatientMutation.mutateAsync(values);
    },
  });

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    appointmentForm.setFieldValue('patient_id', patient.id);
    setPatientSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Book New Appointment</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Patient Selection Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">1. Select Patient</h4>

              {selectedPatient ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-primary-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedPatient.patient_code} • {selectedPatient.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      appointmentForm.setFieldValue('patient_id', '');
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
              ) : showNewPatient ? (
                /* New Patient Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Register New Patient</h5>
                    <button
                      onClick={() => setShowNewPatient(false)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      ← Search Existing
                    </button>
                  </div>

                  <form onSubmit={patientForm.handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Name *</label>
                        <input
                          type="text"
                          className="input"
                          {...patientForm.getFieldProps('name')}
                        />
                        {patientForm.touched.name && patientForm.errors.name && (
                          <p className="mt-1 text-sm text-red-600">{patientForm.errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="label">Phone *</label>
                        <input
                          type="tel"
                          className="input"
                          {...patientForm.getFieldProps('phone')}
                        />
                        {patientForm.touched.phone && patientForm.errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{patientForm.errors.phone}</p>
                        )}
                      </div>
                      <div>
                        <label className="label">Age *</label>
                        <input
                          type="number"
                          className="input"
                          {...patientForm.getFieldProps('age')}
                        />
                        {patientForm.touched.age && patientForm.errors.age && (
                          <p className="mt-1 text-sm text-red-600">{patientForm.errors.age}</p>
                        )}
                      </div>
                      <div>
                        <label className="label">Gender *</label>
                        <select className="input" {...patientForm.getFieldProps('gender')}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {patientForm.touched.gender && patientForm.errors.gender && (
                          <p className="mt-1 text-sm text-red-600">{patientForm.errors.gender}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={patientForm.isSubmitting}
                      className="btn btn-primary w-full"
                    >
                      {patientForm.isSubmitting ? 'Registering...' : 'Register & Continue'}
                    </button>
                  </form>
                </div>
              ) : (
                /* Patient Search */
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patient by name or phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="input pl-10"
                    />
                  </div>

                  {patientSearch.length >= 2 && patients.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                      {patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center"
                        >
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              {patient.patient_code} • {patient.phone} • {patient.age}y,{' '}
                              {patient.gender}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowNewPatient(true)}
                    className="btn btn-secondary w-full inline-flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Register New Patient
                  </button>
                </div>
              )}
            </div>

            {/* Appointment Details Form */}
            {selectedPatient && (
              <form onSubmit={appointmentForm.handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">2. Appointment Details</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Doctor Selection */}
                    <div>
                      <label htmlFor="doctor_id" className="label">
                        Doctor *
                      </label>
                      <select
                        id="doctor_id"
                        className="input"
                        {...appointmentForm.getFieldProps('doctor_id')}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                      {appointmentForm.touched.doctor_id && appointmentForm.errors.doctor_id && (
                        <p className="mt-1 text-sm text-red-600">
                          {appointmentForm.errors.doctor_id}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div>
                      <label htmlFor="appointment_date" className="label">
                        Date *
                      </label>
                      <input
                        id="appointment_date"
                        type="date"
                        className="input"
                        min={new Date().toISOString().split('T')[0]}
                        {...appointmentForm.getFieldProps('appointment_date')}
                      />
                      {appointmentForm.touched.appointment_date &&
                        appointmentForm.errors.appointment_date && (
                          <p className="mt-1 text-sm text-red-600">
                            {appointmentForm.errors.appointment_date}
                          </p>
                        )}
                    </div>

                    {/* Time */}
                    <div className="md:col-span-2">
                      <label htmlFor="appointment_time" className="label">
                        Time *
                      </label>
                      <input
                        id="appointment_time"
                        type="time"
                        className="input"
                        {...appointmentForm.getFieldProps('appointment_time')}
                      />
                      {appointmentForm.touched.appointment_time &&
                        appointmentForm.errors.appointment_time && (
                          <p className="mt-1 text-sm text-red-600">
                            {appointmentForm.errors.appointment_time}
                          </p>
                        )}
                      
                      {/* Show today's booked times if selecting today */}
                      {appointmentForm.values.appointment_date === format(new Date(), 'yyyy-MM-dd') && todayAppointments.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              <p className="text-sm font-semibold text-gray-900">Today's Schedule</p>
                              <span className="text-xs text-gray-500">({todayAppointments.length} booked)</span>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 max-h-64 overflow-y-auto">
                            <div className="space-y-3">
                              {todayAppointments
                                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                                .map((apt, index) => {
                                  const endTime = new Date(`2000-01-01T${apt.appointment_time}`);
                                  endTime.setMinutes(endTime.getMinutes() + (apt.duration_minutes || 30));
                                  const endTimeStr = endTime.toTimeString().slice(0, 5);
                                  
                                  const statusColors = {
                                    scheduled: 'bg-orange-100 text-orange-700 border-orange-200',
                                    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
                                    completed: 'bg-green-100 text-green-700 border-green-200',
                                    cancelled: 'bg-red-100 text-red-700 border-red-200',
                                    missed: 'bg-gray-100 text-gray-700 border-gray-200'
                                  };
                                  
                                  return (
                                    <div key={apt.id} className="relative">
                                      {/* Timeline connector */}
                                      {index < todayAppointments.length - 1 && (
                                        <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-transparent"></div>
                                      )}
                                      
                                      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200">
                                        <div className="flex items-start gap-3">
                                          {/* Time indicator */}
                                          <div className="flex-shrink-0">
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                              <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                          </div>
                                          
                                          {/* Appointment details */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">
                                                  {apt.appointment_time?.slice(0, 5)}
                                                </span>
                                                <span className="text-xs text-gray-400">→</span>
                                                <span className="text-xs text-gray-600">
                                                  {endTimeStr}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                  ({apt.duration_minutes || 30}m)
                                                </span>
                                              </div>
                                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[apt.status] || statusColors.scheduled}`}>
                                                {apt.status === 'in_progress' ? 'In Progress' : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                              </span>
                                            </div>
                                            
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {apt.patient_name}
                                            </p>
                                            
                                            {apt.chief_complaint && (
                                              <p className="text-xs text-gray-600 truncate mt-1">
                                                {apt.chief_complaint}
                                              </p>
                                            )}
                                            
                                            {apt.doctor_name && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                Dr. {apt.doctor_name}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                            
                            {/* Helper text */}
                            <div className="mt-4 pt-3 border-t border-blue-200">
                              <div className="flex items-center gap-2 text-xs text-blue-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Choose a time slot that doesn't overlap with existing appointments</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    <div>
                      <label htmlFor="duration_minutes" className="label">
                        Duration (minutes)
                      </label>
                      <select
                        id="duration_minutes"
                        className="input"
                        {...appointmentForm.getFieldProps('duration_minutes')}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>

                    {/* Chief Complaint */}
                    <div className="md:col-span-2">
                      <label htmlFor="chief_complaint" className="label">
                        Chief Complaint / Reason for Visit
                      </label>
                      <textarea
                        id="chief_complaint"
                        rows="2"
                        className="input"
                        placeholder="Brief description of the reason for visit..."
                        {...appointmentForm.getFieldProps('chief_complaint')}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={appointmentForm.isSubmitting}
                    className="btn btn-primary"
                  >
                    {appointmentForm.isSubmitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
