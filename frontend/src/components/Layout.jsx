import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  Pill,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Medicines', href: '/medicines', icon: Pill },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-primary-700 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-5 bg-primary-800">
            <Activity className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">ACMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-primary-200 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="ml-3 inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-primary-700 px-4 py-3">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">ACMS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-primary-700 pt-16">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-800 text-white'
                          : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-primary-200 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="ml-3 inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0 pb-20 md:pb-0">
          <div className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active
                    ? 'text-primary-600'
                    : 'text-gray-500 active:text-primary-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'stroke-2' : ''}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
