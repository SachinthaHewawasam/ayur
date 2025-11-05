import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, X, Search, User, Package, 
  Calendar, CreditCard, Trash2, Save, Building2
} from 'lucide-react';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceType = searchParams.get('type') || 'sale'; // 'sale' or 'purchase'

  const [formData, setFormData] = useState({
    type: invoiceType,
    customer: null,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [],
    notes: '',
    paymentMethod: 'cash'
  });

  const [itemSearch, setItemSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);

  const [newItem, setNewItem] = useState({ name: '', price: '', unit: 'pack' });
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '' });

  // Mock data - replace with actual API calls
  const mockCustomers = [
    { id: 1, name: 'John Doe', code: 'P001', phone: '9876543210', type: 'patient' },
    { id: 2, name: 'Jane Smith', code: 'P002', phone: '9876543211', type: 'patient' }
  ];

  const mockSuppliers = [
    { id: 101, name: 'Ayurvedic Herbs Ltd', code: 'S001', phone: '9876543200', type: 'supplier' },
    { id: 102, name: 'Natural Medicine Co', code: 'S002', phone: '9876543201', type: 'supplier' },
    { id: 103, name: 'Wellness Distributors', code: 'S003', phone: '9876543202', type: 'supplier' }
  ];

  const mockItems = [
    { id: 1, name: 'Ashwagandha Powder', price: 250, stock: 50, unit: 'pack', type: 'medicine' },
    { id: 2, name: 'Triphala Churna', price: 180, stock: 30, unit: 'pack', type: 'medicine' },
    { id: 3, name: 'Brahmi Capsules', price: 320, stock: 25, unit: 'bottle', type: 'medicine' },
    { id: 4, name: 'Consultation Fee', price: 500, type: 'service' }
  ];

  const isSale = formData.type === 'sale';
  const customerList = isSale ? mockCustomers : mockSuppliers;
  const filteredCustomers = customerList.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(customerSearch.toLowerCase())
  );
  const filteredItems = mockItems.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const addItem = (item) => {
    const existingItem = formData.items.find(i => i.id === item.id);
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { ...item, quantity: 1 }]
      });
    }
    setItemSearch('');
    setShowItemDropdown(false);
  };

  const removeItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.id !== itemId)
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    setFormData({
      ...formData,
      items: formData.items.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const addNewItem = () => {
    if (!newItem.name || !newItem.price) return;
    const item = {
      id: `new-${Date.now()}`,
      name: newItem.name,
      price: parseFloat(newItem.price),
      unit: newItem.unit,
      type: 'custom',
      quantity: 1
    };
    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ name: '', price: '', unit: 'pack' });
    setShowNewItemForm(false);
    setItemSearch('');
  };

  const addNewSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone) return;
    const supplier = {
      id: `new-${Date.now()}`,
      name: newSupplier.name,
      code: `S${Date.now().toString().slice(-3)}`,
      phone: newSupplier.phone,
      email: newSupplier.email,
      address: newSupplier.address,
      type: 'supplier'
    };
    setFormData({ ...formData, customer: supplier });
    setNewSupplier({ name: '', phone: '', email: '', address: '' });
    setShowNewSupplierForm(false);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const updateItemPrice = (itemId, price) => {
    if (price < 0) return;
    setFormData({
      ...formData,
      items: formData.items.map(i =>
        i.id === itemId ? { ...i, price: parseFloat(price) || 0 } : i
      )
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Creating invoice:', formData);
    navigate('/invoices');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/invoices')}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-light text-gray-900">
                  New {isSale ? 'Sale' : 'Purchase'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create a new {isSale ? 'sales invoice' : 'purchase bill'}
                </p>
              </div>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
              <button
                onClick={() => setFormData({ ...formData, type: 'sale' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSale
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sale
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'purchase' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isSale
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Customer/Supplier Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {isSale ? 'Patient' : 'Supplier'}
          </label>
          
          {formData.customer ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{formData.customer.name}</p>
                  <p className="text-sm text-gray-500">{formData.customer.code} • {formData.customer.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer: null })}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={`Search ${isSale ? 'patient' : 'supplier'}...`}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
              
              {customerSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-10">
                  {mockCustomers
                    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                    .map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, customer });
                          setCustomerSearch('');
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.code} • {customer.phone}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Invoice Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Items</h3>
          
          {/* Add Item Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Search medicines or services..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
            
            {itemSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-10">
                {mockItems
                  .filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase()))
                  .map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.type === 'service' ? 'Service' : `Stock: ${item.stock} ${item.unit}`}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">₹{item.price}</p>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Items List */}
          {formData.items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No items added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="w-24 text-right font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment & Notes */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes..."
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Total & Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-4xl font-light text-gray-900">₹{calculateTotal().toLocaleString()}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.customer || formData.items.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
