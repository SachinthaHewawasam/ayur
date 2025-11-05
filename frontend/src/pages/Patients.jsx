import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, User, Users, TrendingUp, Phone, Mail, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import PatientModal from '../components/PatientModal';

export default function PatientsDashboardStyle() {
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
    refetchOnMount: true,
    retry: 2,
  });

  const patients = data?.patients || [];

  // Calculate stats (matching Dashboard style)
  const stats = useMemo(() => {
    const total = patients.length;
    const thisMonth = patients.filter(p => {
      const created = new Date(p.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;
    
    return [
      {
        name: 'Total Patients',
        value: total,
        icon: Users,
        color: 'bg-blue-500'
      },
      {
        name: 'New This Month',
        value: thisMonth,
        icon: TrendingUp,
        color: 'bg-green-500'
      },
      {
        name: 'Active',
        value: Math.floor(total * 0.85),
        icon: User,
        color: 'bg-purple-500'
      }
    ];
  }, [patients]);

  return (
    <div className="space-y-6">
      {/* Header (matching Dashboard) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            Manage patient records and information
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Stats Grid (matching Dashboard) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or patient code..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients List (matching Dashboard style) */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Patients</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No patients found</h3>
              <p className="text-xs text-gray-500 mb-4">
                {search ? 'Try a different search term' : 'Get started by adding your first patient'}
              </p>
              {!search && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
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
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Patient Info (matching Dashboard style) */}
                    <div className="flex gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {patient.name}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{patient.patient_code}</p>
                          {patient.dosha_type && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ayur-leaf/20 text-ayur-leaf capitalize">
                                {patient.dosha_type.replace('_', '-')}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {patient.phone && (
                            <p className="text-xs text-gray-600">{patient.phone}</p>
                          )}
                          {patient.email && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-600 truncate">{patient.email}</p>
                            </>
                          )}
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-600">{patient.age} years, {patient.gender}</p>
                        </div>
                      </div>
                    </div>
                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
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
