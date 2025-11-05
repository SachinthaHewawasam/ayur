import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Building2, Users, Save, Plus, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch current user (profile)
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  });

  const currentUser = userData?.user || {};

  // Fetch system settings
  const { data: settingsData } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const response = await api.get('/settings/system');
      return response.data;
    },
  });

  const systemSettings = settingsData?.settings || {};

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const users = usersData?.users || [];

  // Forms
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    specialization: currentUser.specialization || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemForm, setSystemForm] = useState({
    system_name: systemSettings.system_name || 'ACMS',
    clinic_name: systemSettings.clinic_name || '',
    clinic_address: systemSettings.clinic_address || '',
    clinic_phone: systemSettings.clinic_phone || '',
    clinic_email: systemSettings.clinic_email || ''
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor',
    specialization: '',
    password: '',
    confirmPassword: ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Profile updated successfully');
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Update system settings mutation
  const updateSystemMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/settings/system', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      toast.success('System settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User created successfully');
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', phone: '', role: 'doctor', specialization: '', password: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User updated successfully');
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', phone: '', role: 'doctor', specialization: '', password: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const data = {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      specialization: profileForm.specialization,
    };

    if (profileForm.newPassword) {
      data.currentPassword = profileForm.currentPassword;
      data.newPassword = profileForm.newPassword;
    }

    updateProfileMutation.mutate(data);
  };

  const handleSystemSubmit = (e) => {
    e.preventDefault();
    updateSystemMutation.mutate(systemForm);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    if (!editingUser && userForm.password !== userForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const data = {
      name: userForm.name,
      email: userForm.email,
      phone: userForm.phone,
      role: userForm.role,
      specialization: userForm.specialization,
    };

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      data.password = userForm.password;
      createUserMutation.mutate(data);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      specialization: user.specialization || '',
      password: '',
      confirmPassword: ''
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Sync profile form when user data loads
  useEffect(() => {
    if (currentUser.name) {
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        specialization: currentUser.specialization || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [currentUser.name, currentUser.email, currentUser.phone, currentUser.specialization]);

  // Sync system form when settings load
  useEffect(() => {
    if (systemSettings.system_name) {
      setSystemForm({
        system_name: systemSettings.system_name,
        clinic_name: systemSettings.clinic_name || '',
        clinic_address: systemSettings.clinic_address || '',
        clinic_phone: systemSettings.clinic_phone || '',
        clinic_email: systemSettings.clinic_email || ''
      });
    }
  }, [systemSettings.system_name, systemSettings.clinic_name, systemSettings.clinic_address, systemSettings.clinic_phone, systemSettings.clinic_email]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile, system, and users</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-900 p-3 rounded-lg"><User className="h-6 w-6 text-white" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Specialization</label>
                  <input type="text" value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <input type={showPassword[field] ? 'text' : 'password'} value={profileForm[field]}
                        onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all pr-10" />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, [field]: !showPassword[field] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave blank to keep current password</p>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={updateProfileMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50">
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-900 p-3 rounded-lg"><Building2 className="h-6 w-6 text-white" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
              <p className="text-sm text-gray-500">Configure system branding and clinic details</p>
            </div>
          </div>
          <form onSubmit={handleSystemSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">System Branding</h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">System Name *</label>
                <input type="text" value={systemForm.system_name} onChange={(e) => setSystemForm({ ...systemForm, system_name: e.target.value })} required
                  className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" placeholder="ACMS or Nirvaan" />
                <p className="text-xs text-gray-500 mt-1">This will appear throughout the application</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Clinic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Clinic Name</label>
                  <input type="text" value={systemForm.clinic_name} onChange={(e) => setSystemForm({ ...systemForm, clinic_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Address</label>
                  <textarea value={systemForm.clinic_address} onChange={(e) => setSystemForm({ ...systemForm, clinic_address: e.target.value })} rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={systemForm.clinic_phone} onChange={(e) => setSystemForm({ ...systemForm, clinic_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={systemForm.clinic_email} onChange={(e) => setSystemForm({ ...systemForm, clinic_email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={updateSystemMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50">
                <Save className="h-4 w-4" />
                {updateSystemMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-900 p-3 rounded-lg"><Users className="h-6 w-6 text-white" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                  <p className="text-sm text-gray-500">Manage doctors and staff members</p>
                </div>
              </div>
              <button onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', phone: '', role: 'doctor', specialization: '', password: '', confirmPassword: '' }); setShowUserModal(true); }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                <Plus className="h-4 w-4" />Add User
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${user.role === 'admin' ? 'bg-purple-50' : user.role === 'doctor' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        {user.role === 'admin' ? <Shield className="h-5 w-5 text-purple-600" /> : <User className={`h-5 w-5 ${user.role === 'doctor' ? 'text-blue-600' : 'text-gray-600'}`} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            user.role === 'admin' ? 'bg-purple-50 text-purple-600' : user.role === 'doctor' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                          }`}>{user.role}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{user.email}</span>
                          {user.phone && <><span className="text-gray-300">•</span><span className="text-xs text-gray-500">{user.phone}</span></>}
                          {user.specialization && <><span className="text-gray-300">•</span><span className="text-xs text-gray-500">{user.specialization}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditUser(user)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">Edit</button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(user.id)} disabled={deleteUserMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Role *</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all">
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Specialization</label>
                  <input type="text" value={userForm.specialization} onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                </div>
              </div>
              {!editingUser && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Login Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Password *</label>
                      <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Confirm Password *</label>
                      <input type="password" value={userForm.confirmPassword} onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })} required
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">Cancel</button>
                <button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50">
                  {(createUserMutation.isPending || updateUserMutation.isPending) ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
