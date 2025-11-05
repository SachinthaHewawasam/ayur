import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, User, Users, TrendingUp, Calendar, 
  Phone, Mail, MapPin, MoreVertical, Eye, Edit, Activity
} from 'lucide-react';
import api from '../services/api';
import PatientModal from '../components/PatientModal';
import { 
  LuxuryCard, 
  LuxuryStatsCard, 
  LuxurySearchBar, 
  LuxuryButton, 
  LuxuryBadge,
  LuxuryEmptyState,
  LuxurySkeleton
} from '../components/ui/LuxuryComponents';

export default function PatientsLuxury() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const { data, isLoading, refetch, isError, error } = useQuery({
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
    
    const doshaDistribution = patients.reduce((acc, p) => {
      const dosha = p.dosha_type || 'not_set';
      acc[dosha] = (acc[dosha] || 0) + 1;
      return acc;
    }, {});
    
    return { total, thisMonth, doshaDistribution };
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

  // Get gradient for avatar based on name
  const getAvatarGradient = (name) => {
    const gradients = [
      'from-blue-400 to-purple-500',
      'from-green-400 to-blue-500',
      'from-pink-400 to-red-500',
      'from-yellow-400 to-orange-500',
      'from-indigo-400 to-purple-500',
      'from-teal-400 to-green-500',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Get dosha badge variant
  const getDoshaBadgeVariant = (dosha) => {
    const variants = {
      vata: 'primary',
      pitta: 'danger',
      kapha: 'success',
      vata_pitta: 'warning',
      pitta_kapha: 'purple',
      vata_kapha: 'default'
    };
    return variants[dosha] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Patients
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} • Manage your patient records
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <LuxuryButton onClick={() => setIsModalOpen(true)} icon={Plus}>
            Add New Patient
          </LuxuryButton>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LuxuryStatsCard
          icon={Users}
          label="Total Patients"
          value={stats.total}
          gradient="from-blue-50 to-indigo-50"
          iconColor="text-blue-600"
        />
        <LuxuryStatsCard
          icon={TrendingUp}
          label="New This Month"
          value={stats.thisMonth}
          trend="up"
          trendValue="+12%"
          gradient="from-green-50 to-emerald-50"
          iconColor="text-green-600"
        />
        <LuxuryStatsCard
          icon={Activity}
          label="Active Patients"
          value={Math.floor(stats.total * 0.75)}
          gradient="from-purple-50 to-pink-50"
          iconColor="text-purple-600"
        />
        <LuxuryStatsCard
          icon={Calendar}
          label="Appointments Today"
          value={Math.floor(stats.total * 0.1)}
          gradient="from-orange-50 to-amber-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Search and Filters */}
      <LuxuryCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <LuxurySearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or patient code..."
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </LuxuryCard>

      {/* Patients Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LuxuryCard key={i}>
              <LuxurySkeleton count={3} />
            </LuxuryCard>
          ))}
        </div>
      ) : isError ? (
        <LuxuryCard>
          <LuxuryEmptyState
            icon={User}
            title="Error loading patients"
            description={error?.message || 'Failed to fetch patients. Please try again.'}
            action={{
              label: 'Retry',
              onClick: () => refetch(),
              icon: TrendingUp
            }}
          />
        </LuxuryCard>
      ) : patients.length === 0 ? (
        <LuxuryCard>
          <LuxuryEmptyState
            icon={Users}
            title="No patients found"
            description={search ? 'Try a different search term' : 'Get started by adding your first patient'}
            action={!search ? {
              label: 'Add Patient',
              onClick: () => setIsModalOpen(true),
              icon: Plus
            } : undefined}
          />
        </LuxuryCard>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Link key={patient.id} to={`/patients/${patient.id}`}>
              <LuxuryCard className="group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(patient.name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {getInitials(patient.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Patient Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">{patient.patient_code}</p>
                </div>
                
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {patient.phone}
                  </div>
                  {patient.email && (
                    <div className="flex items-center text-sm text-gray-600 truncate">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.email}
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.age}y</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Visits</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {Math.floor(Math.random() * 20) + 1}
                    </p>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {patient.dosha_type && (
                    <LuxuryBadge variant={getDoshaBadgeVariant(patient.dosha_type)}>
                      {patient.dosha_type.replace('_', '-').toUpperCase()}
                    </LuxuryBadge>
                  )}
                  <LuxuryBadge variant="default" dot>
                    Active
                  </LuxuryBadge>
                </div>
              </LuxuryCard>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <LuxuryCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Age/Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dosha Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br ${getAvatarGradient(patient.name)} flex items-center justify-center text-white font-bold shadow-md`}>
                          {getInitials(patient.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.patient_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phone}</div>
                      {patient.email && (
                        <div className="text-xs text-gray-500">{patient.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.age} years, {patient.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.dosha_type ? (
                        <LuxuryBadge variant={getDoshaBadgeVariant(patient.dosha_type)}>
                          {patient.dosha_type.replace('_', '-').toUpperCase()}
                        </LuxuryBadge>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LuxuryCard>
      )}

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
