import { useState, useEffect } from 'react';
import { User, Building2, Users, Save, Plus, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock current user
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Admin',
    email: 'admin@clinic.lk',
    phone: '+94 77 123 4567',
    specialization: 'Ayurvedic Medicine',
    role: 'admin'
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    system_name: 'ACMS',
    clinic_name: 'Nirvaan Ayurvedic Clinic',
    clinic_address: '123 Galle Road, Colombo 03, Sri Lanka',
    clinic_phone: '+94 11 234 5678',
    clinic_email: 'info@nirvaan.lk'
  });

  // Users list
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Dr. Admin',
      email: 'admin@clinic.lk',
      phone: '+94 77 123 4567',
      role: 'admin',
      specialization: 'Ayurvedic Medicine'
    }
  ]);

  // Forms
  const [profileForm, setProfileForm] = useState({ ...currentUser, currentPassword: '', newPassword: '', confirmPassword: '' });
  const [systemForm, setSystemForm] = useState(systemSettings);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'doctor', specialization: '', password: '', confirmPassword: '' });

  // Sync profileForm with currentUser
  useEffect(() => {
    setProfileForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      specialization: currentUser.specialization,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [currentUser]);

  // Sync systemForm with systemSettings
  useEffect(() => {
    setSystemForm(systemSettings);
  }, [systemSettings]);

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
    
    // Update current user
    const updatedUser = { 
      ...currentUser, 
      name: profileForm.name, 
      email: profileForm.email, 
      phone: profileForm.phone, 
      specialization: profileForm.specialization 
    };
    setCurrentUser(updatedUser);
    
    // Update in users list if exists
    setUsers(users.map(u => u.id === 1 ? updatedUser : u));
    
    // Clear password fields but keep updated profile data
    setProfileForm({ 
      ...updatedUser, 
      currentPassword: '', 
      newPassword: '', 
      confirmPassword: '' 
    });
    
    toast.success('Profile updated successfully');
  };

  const handleSystemSubmit = (e) => {
    e.preventDefault();
    setSystemSettings(systemForm);
    toast.success('System settings updated successfully');
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!editingUser && userForm.password !== userForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
      toast.success('User updated');
    } else {
      setUsers([...users, { id: users.length + 1, ...userForm }]);
      toast.success('User created');
    }
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', phone: '', role: 'doctor', specialization: '', password: '', confirmPassword: '' });
  };

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
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                <Save className="h-4 w-4" />Save Changes
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
              <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                <Save className="h-4 w-4" />Save Changes
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
                      <button onClick={() => { setEditingUser(user); setUserForm({ ...user, password: '', confirmPassword: '' }); setShowUserModal(true); }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">Edit</button>
                      {user.role !== 'admin' && (
                        <button onClick={() => { if (window.confirm('Delete this user?')) { setUsers(users.filter(u => u.id !== user.id)); toast.success('User deleted'); } }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">{editingUser ? 'Update' : 'Create'} User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
