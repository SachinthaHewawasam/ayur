import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Package, AlertTriangle, Calendar, 
  TrendingUp, DollarSign, Archive, Activity, Pill
} from 'lucide-react';
import api from '../services/api';
import { 
  LuxuryCard, 
  LuxuryStatsCard, 
  LuxurySearchBar, 
  LuxuryButton, 
  LuxuryBadge,
  LuxuryEmptyState,
  LuxurySkeleton
} from '../components/ui/LuxuryComponents';

export default function MedicinesLuxury() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['medicines', search, categoryFilter],
    queryFn: async () => {
      const response = await api.get('/medicines', {
        params: { search, category: categoryFilter },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const medicines = data?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = medicines.length;
    const lowStock = medicines.filter(m => m.quantity <= m.min_quantity).length;
    const expiringSoon = medicines.filter(m => {
      const expiryDate = new Date(m.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    const totalValue = medicines.reduce((sum, m) => sum + (m.quantity * m.price), 0);
    
    return { total, lowStock, expiringSoon, totalValue };
  }, [medicines]);

  const getStockLevel = (medicine) => {
    const percentage = (medicine.quantity / (medicine.min_quantity * 3)) * 100;
    if (percentage <= 33) return { level: 'critical', color: 'red', label: 'Critical' };
    if (percentage <= 66) return { level: 'low', color: 'orange', label: 'Low' };
    return { level: 'good', color: 'green', label: 'Good' };
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (days) => {
    if (days < 0) return { variant: 'danger', label: 'Expired' };
    if (days <= 30) return { variant: 'danger', label: `${days}d left` };
    if (days <= 90) return { variant: 'warning', label: `${days}d left` };
    return { variant: 'success', label: `${days}d left` };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Medicines
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} • Manage your inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <LuxuryButton onClick={() => navigate('/medicines/new')} icon={Plus}>
            Add Medicine
          </LuxuryButton>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LuxuryStatsCard
          icon={Package}
          label="Total Medicines"
          value={stats.total}
          gradient="from-blue-50 to-indigo-50"
          iconColor="text-blue-600"
        />
        <LuxuryStatsCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.lowStock}
          gradient="from-orange-50 to-amber-50"
          iconColor="text-orange-600"
        />
        <LuxuryStatsCard
          icon={Calendar}
          label="Expiring Soon"
          value={stats.expiringSoon}
          gradient="from-red-50 to-rose-50"
          iconColor="text-red-600"
        />
        <LuxuryStatsCard
          icon={DollarSign}
          label="Inventory Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          trend="up"
          trendValue="+5%"
          gradient="from-green-50 to-emerald-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Search and Filters */}
      <LuxuryCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <LuxurySearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines by name or category..."
              icon={Search}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">All Categories</option>
              <option value="tablet">Tablets</option>
              <option value="syrup">Syrups</option>
              <option value="powder">Powders</option>
              <option value="oil">Oils</option>
              <option value="capsule">Capsules</option>
            </select>
          </div>
        </div>
      </LuxuryCard>

      {/* Medicines Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LuxuryCard key={i}>
              <LuxurySkeleton count={3} />
            </LuxuryCard>
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <LuxuryCard>
          <LuxuryEmptyState
            icon={Package}
            title="No medicines found"
            description={search || categoryFilter ? 'Try adjusting your filters' : 'Get started by adding your first medicine'}
            action={!search && !categoryFilter ? {
              label: 'Add Medicine',
              onClick: () => navigate('/medicines/new'),
              icon: Plus
            } : undefined}
          />
        </LuxuryCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine) => {
            const stockInfo = getStockLevel(medicine);
            const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date);
            const expiryStatus = getExpiryStatus(daysUntilExpiry);
            const stockPercentage = Math.min((medicine.quantity / (medicine.min_quantity * 3)) * 100, 100);

            return (
              <Link key={medicine.id} to={`/medicines/${medicine.id}`}>
                <LuxuryCard className="group cursor-pointer h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Pill className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {medicine.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">{medicine.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Stock Level</span>
                      <LuxuryBadge variant={stockInfo.level === 'critical' ? 'danger' : stockInfo.level === 'low' ? 'warning' : 'success'}>
                        {stockInfo.label}
                      </LuxuryBadge>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          stockInfo.level === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          stockInfo.level === 'low' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{medicine.quantity} units</span>
                      <span className="text-xs text-gray-500">Min: {medicine.min_quantity}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Price</p>
                      <p className="text-lg font-bold text-blue-900">₹{medicine.price}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">Value</p>
                      <p className="text-lg font-bold text-purple-900">
                        ₹{(medicine.quantity * medicine.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Expiry Info */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          Expires: {new Date(medicine.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                      <LuxuryBadge variant={expiryStatus.variant}>
                        {expiryStatus.label}
                      </LuxuryBadge>
                    </div>
                  </div>

                  {/* Alerts */}
                  {(stockInfo.level === 'critical' || daysUntilExpiry <= 30) && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        <span>
                          {stockInfo.level === 'critical' && 'Low stock! '}
                          {daysUntilExpiry <= 30 && 'Expiring soon!'}
                        </span>
                      </div>
                    </div>
                  )}
                </LuxuryCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
