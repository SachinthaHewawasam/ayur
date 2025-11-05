import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Building2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import ProfileTab from '../components/settings/ProfileTab';
import SystemTab from '../components/settings/SystemTab';
import UsersTab from '../components/settings/UsersTab';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch current user/admin data
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  });

  // Fetch system settings
  const { data: systemSettings, isLoading: loadingSystem } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      // Mock data for now - will be replaced with actual API
      return {
        settings: {
          system_name: 'ACMS',
          clinic_name: '',
          clinic_address: '',
          clinic_phone: '',
          clinic_email: '',
        }
      };
    },
  });

  // Fetch users (doctors/staff)
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
  ];

  if (loadingUser || loadingSystem || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile, system, and users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileTab userData={userData} />}
      {activeTab === 'system' && <SystemTab systemSettings={systemSettings} />}
      {activeTab === 'users' && <UsersTab usersData={usersData} />}
    </div>
  );
}
