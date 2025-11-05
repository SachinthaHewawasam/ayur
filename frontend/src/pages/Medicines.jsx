import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Package, AlertTriangle, Calendar, 
  DollarSign, Archive, ChevronRight
} from 'lucide-react';
import api from '../services/api';

export default function Medicines() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['medicines', search, categoryFilter],
    queryFn: async () => {
      const response = await api.get('/medicines', {
        params: { search, category: categoryFilter },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const medicines = data?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = medicines.length;
    const lowStock = medicines.filter(m => {
      const qty = m.quantity_stock || m.quantity || 0;
      const minQty = m.minimum_stock_level || m.min_quantity || 0;
      return qty <= minQty;
    }).length;
    const expiringSoon = medicines.filter(m => {
      if (!m.expiry_date) return false;
      const expiryDate = new Date(m.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    const totalValue = medicines.reduce((sum, m) => {
      const qty = m.quantity_stock || m.quantity || 0;
      const price = m.price_per_unit || m.price || 0;
      return sum + (qty * price);
    }, 0);
    
    return { total, lowStock, expiringSoon, totalValue };
  }, [medicines]);

  const getStockStatus = (medicine) => {
    const quantity = medicine.quantity_stock || medicine.quantity || 0;
    if (!quantity || quantity === 0) {
      return { color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' };
    }
    if (quantity <= medicine.minimum_stock_level) {
      return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Low Stock' };
    }
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'In Stock' };
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (days) => {
    if (days === null) return null;
    if (days < 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Expired' };
    if (days <= 30) return { color: 'text-red-600', bg: 'bg-red-50', label: `${days}d` };
    if (days <= 90) return { color: 'text-amber-600', bg: 'bg-amber-50', label: `${days}d` };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: `${days}d` };
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(search.toLowerCase()) ||
                         medicine.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || medicine.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicines</h1>
          <p className="text-gray-600 mt-1">
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} in inventory
          </p>
        </div>
        <button
          onClick={() => navigate('/medicines/new')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Stats Grid - Dashboard Style */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Medicines</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-amber-50 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.lowStock}</p>
          <p className="text-xs text-gray-500">Low Stock</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.expiringSoon}</p>
          <p className="text-xs text-gray-500">Expiring Soon</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">LKR {stats.totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Inventory Value</p>
        </div>
      </div>

      {/* Alerts - Dashboard Style */}
      {(stats.lowStock > 0 || stats.expiringSoon > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stats.lowStock > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-900">Low Stock Alert</h3>
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  {stats.lowStock}
                </span>
              </div>
              <p className="text-xs text-amber-700">
                {stats.lowStock} medicine{stats.lowStock !== 1 ? 's' : ''} running low on stock
              </p>
            </div>
          )}

          {stats.expiringSoon > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-red-900">Expiry Alert</h3>
                </div>
                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                  {stats.expiringSoon}
                </span>
              </div>
              <p className="text-xs text-red-700">
                {stats.expiringSoon} medicine{stats.expiringSoon !== 1 ? 's' : ''} expiring within 30 days
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter - Dashboard Style */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          >
            <option value="">All Categories</option>
            <option value="churna">Churna</option>
            <option value="lehya">Lehya</option>
            <option value="kwatha">Kwatha</option>
            <option value="taila">Taila</option>
            <option value="ghrita">Ghrita</option>
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="syrup">Syrup</option>
          </select>
        </div>
      </div>

      {/* Medicines List - Dashboard Style */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {search || categoryFilter ? 'Try adjusting your filters' : 'Get started by adding your first medicine'}
          </p>
          {!search && !categoryFilter && (
            <button
              onClick={() => navigate('/medicines/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Medicine
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredMedicines.map((medicine) => {
              const stockStatus = getStockStatus(medicine);
              const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date);
              const expiryStatus = getExpiryStatus(daysUntilExpiry);

              return (
                <Link
                  key={medicine.id}
                  to={`/medicines/${medicine.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Medicine Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="bg-gray-900 p-3 rounded-lg flex-shrink-0">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                          {medicine.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 capitalize">{medicine.category}</span>
                          {medicine.manufacturer && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500">{medicine.manufacturer}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Stock & Status */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Stock</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{medicine.quantity_stock || medicine.quantity || 0}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="text-sm font-bold text-gray-900">LKR {medicine.price_per_unit || medicine.price || 0}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Value</p>
                        <p className="text-sm font-bold text-gray-900">
                          LKR {((medicine.quantity_stock || medicine.quantity || 0) * (medicine.price_per_unit || medicine.price || 0)).toLocaleString()}
                        </p>
                      </div>

                      {expiryStatus && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Expiry</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Stock</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {medicine.quantity_stock || medicine.quantity || 0}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="text-xs font-bold text-gray-900">LKR {medicine.price_per_unit || medicine.price || 0}</p>
                      </div>
                      {expiryStatus && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expiry</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
