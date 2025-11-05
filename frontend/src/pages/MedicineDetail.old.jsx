import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, TrendingUp, TrendingDown, Save, Plus, Minus } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/medicines')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Add New Medicine' : 'Medicine Details'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isNew ? 'Enter medicine information' : 'View and update medicine information'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={medicine.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sanskrit Name</label>
                  <input
                    type="text"
                    name="sanskrit_name"
                    value={medicine.sanskrit_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={medicine.category}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                  <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={medicine.manufacturer}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Batch & Dates */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Batch & Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                  <input
                    type="text"
                    name="batch_number"
                    value={medicine.batch_number}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                  <input
                    type="date"
                    name="manufacturing_date"
                    value={medicine.manufacturing_date}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={medicine.expiry_date}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Stock & Pricing */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Stock & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isNew && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Initial Stock Quantity</label>
                    <input
                      type="number"
                      name="quantity_stock"
                      value={medicine.quantity_stock}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    name="unit"
                    value={medicine.unit}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                  <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
                  <input
                    type="number"
                    name="minimum_stock_level"
                    value={medicine.minimum_stock_level}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Unit (₹)</label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={medicine.price_per_unit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={medicine.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage Instructions</label>
                  <textarea
                    name="storage_instructions"
                    value={medicine.storage_instructions}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/medicines')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : isNew ? 'Add Medicine' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        {!isNew && (
          <div className="space-y-6">
            {/* Current Stock Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Stock</h3>
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-green-600" />
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {medicine.quantity_stock}
                </p>
                <p className="text-sm text-gray-500">{medicine.unit}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Min Level: {medicine.minimum_stock_level} {medicine.unit}
                </p>
              </div>
              <button
                onClick={() => setShowStockModal(true)}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Update Stock
              </button>
            </div>

            {/* Stock Movements */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Movements</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stockMovements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No stock movements yet</p>
                ) : (
                  stockMovements.slice(0, 10).map((movement) => (
                    <div key={movement.id} className="flex items-start space-x-3 text-sm">
                      {movement.type === 'in' ? (
                        <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium">
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity} {medicine.unit}
                        </p>
                        <p className="text-gray-500 text-xs">{movement.reason}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stock</h3>
            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={stockUpdate.type}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="in">Stock In (Add)</option>
                  <option value="out">Stock Out (Remove)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) })}
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <select
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={stockUpdate.notes}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, notes: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
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
