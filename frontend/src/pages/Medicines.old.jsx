import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import medicineService from '../services/medicine.service';

const Medicines = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    low_stock: false,
    active_only: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch medicines with retry logic
  const fetchMedicines = async (retryCount = 0) => {
    try {
      setLoading(true);
      const data = await medicineService.getAllMedicines({ search, ...filters });
      setMedicines(data.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      // Retry once if it's the first failure
      if (retryCount === 0) {
        setTimeout(() => fetchMedicines(1), 1000);
      } else {
        toast.error('Failed to load medicines');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats with retry logic
  const fetchStats = async (retryCount = 0) => {
    try {
      const data = await medicineService.getInventoryStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Retry once if it's the first failure
      if (retryCount === 0) {
        setTimeout(() => fetchStats(1), 1000);
      }
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchStats();
  }, [search, filters]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      await medicineService.deleteMedicine(id);
      toast.success('Medicine deactivated successfully');
      fetchMedicines();
      fetchStats();
    } catch (error) {
      toast.error('Failed to deactivate medicine');
    }
  };

  const getStockStatusBadge = (medicine) => {
    if (medicine.quantity_stock === 0) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>;
    }
    if (medicine.is_low_stock) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>;
  };

  const getExpiryStatusBadge = (medicine) => {
    if (!medicine.expiry_date) return null;

    if (medicine.expiry_status === 'expired') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    if (medicine.expiry_status === 'expiring_soon') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Expiring Soon</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicine Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your medicine stock and track inventory levels
          </p>
        </div>
        <button
          onClick={() => navigate('/medicines/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Medicines</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_medicines}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.low_stock_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.expiring_soon_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{parseFloat(stats.total_inventory_value || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                <option value="Churna">Churna</option>
                <option value="Lehya">Lehya</option>
                <option value="Kwatha">Kwatha</option>
                <option value="Taila">Taila</option>
                <option value="Ghrita">Ghrita</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
              </select>
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="low_stock"
                checked={filters.low_stock}
                onChange={(e) => setFilters({ ...filters, low_stock: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="low_stock" className="ml-2 block text-sm text-gray-700">
                Show only low stock
              </label>
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="active_only"
                checked={filters.active_only}
                onChange={(e) => setFilters({ ...filters, active_only: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="active_only" className="ml-2 block text-sm text-gray-700">
                Active medicines only
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Medicines Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading medicines...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No medicines found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new medicine.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/medicines/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </button>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        {medicine.sanskrit_name && (
                          <div className="text-sm text-gray-500">{medicine.sanskrit_name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{medicine.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {medicine.quantity_stock} {medicine.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {medicine.minimum_stock_level} {medicine.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{parseFloat(medicine.price_per_unit).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStockStatusBadge(medicine)}
                      {getExpiryStatusBadge(medicine)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/medicines/${medicine.id}`)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="View Details"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.id, medicine.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Results Summary */}
      {!loading && medicines.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {medicines.length} medicine{medicines.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default Medicines;
