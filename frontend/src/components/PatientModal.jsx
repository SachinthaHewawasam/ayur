import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const patientSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  email: Yup.string().email('Invalid email'),
  age: Yup.number().min(0).max(150).required('Age is required'),
  gender: Yup.string().required('Gender is required'),
  dosha_type: Yup.string(),
  allergies: Yup.string(),
  medical_history: Yup.string(),
  address: Yup.string(),
});

export default function PatientModal({ isOpen, onClose, onSuccess, patient = null }) {
  const formik = useFormik({
    initialValues: {
      name: patient?.name || '',
      phone: patient?.phone || '',
      email: patient?.email || '',
      age: patient?.age || '',
      gender: patient?.gender || '',
      dosha_type: patient?.dosha_type || '',
      allergies: patient?.allergies || '',
      medical_history: patient?.medical_history || '',
      address: patient?.address || '',
    },
    validationSchema: patientSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (patient) {
          await api.put(`/patients/${patient.id}`, values);
          toast.success('Patient updated successfully');
        } else {
          await api.post('/patients', values);
          toast.success('Patient registered successfully');
        }
        onSuccess();
      } catch (error) {
        const message = error.response?.data?.message || 'Operation failed';
        toast.error(message);
      }
    },
  });

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
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {patient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="label">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  {...formik.getFieldProps('name')}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  {...formik.getFieldProps('phone')}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="label">
                  Age *
                </label>
                <input
                  id="age"
                  type="number"
                  className="input"
                  {...formik.getFieldProps('age')}
                />
                {formik.touched.age && formik.errors.age && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.age}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="label">
                  Gender *
                </label>
                <select id="gender" className="input" {...formik.getFieldProps('gender')}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.gender}</p>
                )}
              </div>

              {/* Dosha Type */}
              <div>
                <label htmlFor="dosha_type" className="label">
                  Dosha Type
                </label>
                <select
                  id="dosha_type"
                  className="input"
                  {...formik.getFieldProps('dosha_type')}
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

              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="label">
                  Address
                </label>
                <textarea
                  id="address"
                  rows="2"
                  className="input"
                  {...formik.getFieldProps('address')}
                ></textarea>
              </div>

              {/* Allergies */}
              <div className="md:col-span-2">
                <label htmlFor="allergies" className="label">
                  Allergies
                </label>
                <textarea
                  id="allergies"
                  rows="2"
                  className="input"
                  placeholder="List any known allergies..."
                  {...formik.getFieldProps('allergies')}
                ></textarea>
              </div>

              {/* Medical History */}
              <div className="md:col-span-2">
                <label htmlFor="medical_history" className="label">
                  Medical History
                </label>
                <textarea
                  id="medical_history"
                  rows="3"
                  className="input"
                  placeholder="Brief medical history..."
                  {...formik.getFieldProps('medical_history')}
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="btn btn-primary"
              >
                {formik.isSubmitting
                  ? 'Saving...'
                  : patient
                  ? 'Update Patient'
                  : 'Add Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
