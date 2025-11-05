import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, TrendingUp, TrendingDown, Save, 
  AlertTriangle, Calendar, DollarSign, Archive, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import medicineService from '../services/medicine.service';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [medicine, setMedicine] = useState({
    name: '',
    sanskrit_name: '',
    category: 'Churna',
    manufacturer: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity_stock: 0,
    unit: 'units',
    minimum_stock_level: 10,
    price_per_unit: 0,
    description: '',
    storage_instructions: ''
  });
  const [stockMovements, setStockMovements] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({
    type: 'in',
    quantity: 0,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (!isNew) {
      fetchMedicine();
    }
  }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getMedicineById(id);
      setMedicine(data.data);
      setStockMovements(data.data.stock_movements || []);
    } catch (error) {
      console.error('Error fetching medicine:', error);
      toast.error('Failed to load medicine details');
      navigate('/medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      if (isNew) {
        await medicineService.createMedicine(medicine);
        toast.success('Medicine added successfully');
      } else {
        await medicineService.updateMedicine(id, medicine);
        toast.success('Medicine updated successfully');
      }
      navigate('/medicines');
    } catch (error) {
      console.error('Error saving medicine:', error);
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (stockUpdate.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      await medicineService.updateStock(id, stockUpdate);
      toast.success('Stock updated successfully');
      setShowStockModal(false);
      setStockUpdate({ type: 'in', quantity: 0, reason: '', notes: '' });
      fetchMedicine();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine(prev => ({ ...prev, [name]: value }));
  };

  const getStockStatus = () => {
    if (!medicine.quantity_stock) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' };
    if (medicine.quantity_stock <= medicine.minimum_stock_level) {
      return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Low Stock' };
    }
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'In Stock' };
  };

  const getDaysUntilExpiry = () => {
    if (!medicine.expiry_date) return null;
    const days = Math.ceil((new Date(medicine.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return null;
    if (days < 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Expired' };
    if (days <= 30) return { color: 'text-red-600', bg: 'bg-red-50', label: `${days}d left` };
    if (days <= 90) return { color: 'text-amber-600', bg: 'bg-amber-50', label: `${days}d left` };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: `${days}d left` };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const expiryStatus = getExpiryStatus();

  return (
    <div className="space-y-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/medicines')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Add New Medicine' : 'Medicine Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isNew ? 'Enter medicine information' : 'View and update medicine information'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Dashboard Style (Only for existing medicines) */}
      {!isNew && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Current Stock */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stockStatus.bg} p-2 rounded-lg`}>
                <Package className={`h-5 w-5 ${stockStatus.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{medicine.quantity_stock}</p>
            <p className="text-xs text-gray-500">Current Stock ({medicine.unit})</p>
          </div>

          {/* Minimum Level */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{medicine.minimum_stock_level}</p>
            <p className="text-xs text-gray-500">Min Level ({medicine.unit})</p>
          </div>

          {/* Price */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">LKR {medicine.price_per_unit}</p>
            <p className="text-xs text-gray-500">Price per {medicine.unit}</p>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Archive className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              LKR {(medicine.quantity_stock * medicine.price_per_unit).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Value</p>
          </div>
        </div>
      )}

      {/* Alerts - Dashboard Style */}
      {!isNew && (stockStatus.label === 'Low Stock' || stockStatus.label === 'Out of Stock' || (expiryStatus && expiryStatus.label.includes('left'))) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stock Alert */}
          {(stockStatus.label === 'Low Stock' || stockStatus.label === 'Out of Stock') && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-900">{stockStatus.label}</h3>
              </div>
              <p className="text-xs text-amber-700">
                Current stock ({medicine.quantity_stock} {medicine.unit}) is {stockStatus.label === 'Out of Stock' ? 'depleted' : `below minimum level (${medicine.minimum_stock_level} ${medicine.unit})`}
              </p>
              <button
                onClick={() => setShowStockModal(true)}
                className="mt-3 text-xs font-medium text-amber-700 hover:text-amber-800"
              >
                Update Stock →
              </button>
            </div>
          )}

          {/* Expiry Alert */}
          {expiryStatus && expiryStatus.label.includes('left') && (
            <div className={`${expiryStatus.bg} rounded-xl p-4 border ${expiryStatus.bg.replace('bg-', 'border-')}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`h-4 w-4 ${expiryStatus.color}`} />
                <h3 className={`text-sm font-semibold ${expiryStatus.color.replace('text-', 'text-')}`}>
                  {expiryStatus.label.includes('30') ? 'Expiring Soon' : 'Expiring'}
                </h3>
              </div>
              <p className={`text-xs ${expiryStatus.color.replace('600', '700')}`}>
                This medicine will expire in {expiryStatus.label}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Dashboard Style */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={medicine.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="Enter medicine name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Sanskrit Name</label>
                  <input
                    type="text"
                    name="sanskrit_name"
                    value={medicine.sanskrit_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="Enter Sanskrit name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={medicine.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  >
                    <option value="Churna">Churna (Powder)</option>
                    <option value="Lehya">Lehya (Paste)</option>
                    <option value="Kwatha">Kwatha (Decoction)</option>
                    <option value="Taila">Taila (Oil)</option>
                    <option value="Ghrita">Ghrita (Ghee)</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={medicine.manufacturer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="Enter manufacturer"
                  />
                </div>
              </div>
            </div>

            {/* Batch & Dates */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Batch & Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    name="batch_number"
                    value={medicine.batch_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="Batch number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Manufacturing Date</label>
                  <input
                    type="date"
                    name="manufacturing_date"
                    value={medicine.manufacturing_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={medicine.expiry_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Stock & Pricing */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Stock & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isNew && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Initial Stock Quantity</label>
                    <input
                      type="number"
                      name="quantity_stock"
                      value={medicine.quantity_stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                      placeholder="0"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    name="unit"
                    value={medicine.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  >
                    <option value="units">Units</option>
                    <option value="grams">Grams</option>
                    <option value="kg">Kilograms</option>
                    <option value="ml">Milliliters</option>
                    <option value="liters">Liters</option>
                    <option value="tablets">Tablets</option>
                    <option value="capsules">Capsules</option>
                    <option value="bottles">Bottles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Minimum Stock Level</label>
                  <input
                    type="number"
                    name="minimum_stock_level"
                    value={medicine.minimum_stock_level}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Price per Unit (LKR)</label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={medicine.price_per_unit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={medicine.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none"
                    placeholder="Enter medicine description..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Storage Instructions</label>
                  <textarea
                    name="storage_instructions"
                    value={medicine.storage_instructions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none"
                    placeholder="Enter storage instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/medicines')}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : isNew ? 'Add Medicine' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Dashboard Style */}
        {!isNew && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <button
                onClick={() => setShowStockModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                <Activity className="h-4 w-4" />
                Update Stock
              </button>
            </div>

            {/* Stock Movements - Dashboard Style */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Movements</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stockMovements.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No stock movements yet</p>
                  </div>
                ) : (
                  stockMovements.slice(0, 10).map((movement) => (
                    <div key={movement.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        {movement.type === 'in' ? (
                          <div className="bg-emerald-50 p-1.5 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="bg-red-50 p-1.5 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity} {medicine.unit}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{movement.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(movement.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Modal - Dashboard Style */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Stock</h3>
            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={stockUpdate.type}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                >
                  <option value="in">Stock In (Add)</option>
                  <option value="out">Stock Out (Remove)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) })}
                  min="1"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Reason</label>
                <select
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                >
                  <option value="">Select reason</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Prescribed">Prescribed</option>
                  <option value="Expired">Expired</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Return">Return</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={stockUpdate.notes}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none"
                  placeholder="Add notes (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDetail;
