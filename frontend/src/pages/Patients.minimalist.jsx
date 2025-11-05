import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, User, Phone, Mail, Calendar, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import PatientModal from '../components/PatientModal';

export default function PatientsMinimalist() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patients', search],
    queryFn: async () => {
      const response = await api.get('/patients', {
        params: { search },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
    retry: 2,
  });

  const patients = data?.patients || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = patients.length;
    const thisMonth = patients.filter(p => {
      const created = new Date(p.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;
    
    return { total, thisMonth };
  }, [patients]);

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDoshaBadgeColor = (dosha) => {
    const colors = {
      vata: 'bg-blue-50 text-blue-700',
      pitta: 'bg-rose-50 text-rose-700',
      kapha: 'bg-emerald-50 text-emerald-700',
      vata_pitta: 'bg-amber-50 text-amber-700',
      pitta_kapha: 'bg-purple-50 text-purple-700',
      vata_kapha: 'bg-gray-50 text-gray-700'
    };
    return colors[dosha] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalist Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">Patients</h1>
              <p className="text-sm text-gray-500 mt-1">Manage patient records</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Minimalist Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Patients</p>
            <p className="text-3xl font-light text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">New This Month</p>
            <p className="text-3xl font-light text-gray-900">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or patient code..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Patients List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {search ? 'Try a different search term' : 'Get started by adding your first patient'}
            </p>
            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Patient
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className="block bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {getInitials(patient.name)}
                      </span>
                    </div>

                    {/* Patient Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                          {patient.name}
                        </h3>
                        {patient.dosha_type && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDoshaBadgeColor(patient.dosha_type)}`}>
                            {patient.dosha_type.replace('_', '-').toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-mono text-xs">{patient.patient_code}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {patient.phone}
                        </div>
                        {patient.email && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{patient.email}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-base font-medium text-gray-900">{patient.age}y</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-base font-medium text-gray-900 capitalize">{patient.gender}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Registered</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(patient.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Patient Modal */}
      <PatientModal
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
