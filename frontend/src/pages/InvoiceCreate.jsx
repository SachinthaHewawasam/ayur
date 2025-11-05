import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Plus, X, Search, User, Package, 
  Calendar, CreditCard, Trash2, Save, Building2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
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

  const customerList = formData.type === 'sale' ? mockCustomers : mockSuppliers;
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

  const isSale = formData.type === 'sale';

  // Mutation for creating invoice
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData) => {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success(`${isSale ? 'Invoice' : 'Purchase order'} created successfully!`);
      navigate('/invoices');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare invoice data for API
    const invoiceData = {
      patient_id: isSale ? formData.customer?.id : null,
      customer_name: !isSale ? formData.customer?.name : null,
      customer_phone: !isSale ? formData.customer?.phone : null,
      customer_email: !isSale ? formData.customer?.email : null,
      customer_address: !isSale ? formData.customer?.address : null,
      invoice_type: formData.type === 'sale' ? 'retail' : 'purchase',
      invoice_date: formData.date,
      due_date: formData.dueDate || null,
      items: formData.items.map(item => ({
        item_type: item.type === 'service' ? 'service' : 'medicine',
        medicine_id: item.type !== 'custom' && item.type !== 'service' ? item.id : null,
        item_name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'units',
        price_per_unit: item.price,
        discount: 0,
        tax_percentage: 0,
        total: item.price * item.quantity
      })),
      consultation_fee: 0,
      additional_charges: 0,
      discount: 0,
      tax: 0,
      payment_method: formData.paymentMethod,
      payment_status: 'pending',
      notes: formData.notes || null
    };

    createInvoiceMutation.mutate(invoiceData);
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
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  {isSale ? <User className="h-5 w-5 text-white" /> : <Building2 className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{formData.customer.name}</p>
                  <p className="text-sm text-gray-500">{formData.customer.code} • {formData.customer.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer: null })}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder={isSale ? 'Search patient...' : 'Search supplier or add new...'}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
              
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg max-h-64 overflow-y-auto z-10">
                  {filteredCustomers.length > 0 ? (
                    <div className="p-2">
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, customer });
                            setCustomerSearch('');
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {isSale ? <User className="h-4 w-4 text-gray-600" /> : <Building2 className="h-4 w-4 text-gray-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.code} • {customer.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">No {isSale ? 'patients' : 'suppliers'} found</p>
                    </div>
                  )}
                  
                  {!isSale && (
                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSupplierForm(true);
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 p-3 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add New Supplier
                      </button>
                    </div>
                  )}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Items</h3>
            <button
              type="button"
              onClick={() => setShowNewItemForm(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Custom Item
            </button>
          </div>
          
          {/* Add Item Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setShowItemDropdown(true);
              }}
              onFocus={() => setShowItemDropdown(true)}
              placeholder="Search medicines or services..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
            
            {showItemDropdown && itemSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg max-h-64 overflow-y-auto z-10">
                {filteredItems.length > 0 ? (
                  <div className="p-2">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItem(item)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.type === 'service' ? 'Service' : `Stock: ${item.stock} ${item.unit}`}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">LKR {item.price}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">No items found</p>
                  </div>
                )}
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
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        {item.type === 'custom' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Price (editable for purchases) */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Price:</span>
                          {!isSale ? (
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItemPrice(item.id, e.target.value)}
                              className="w-20 px-2 py-1 text-sm bg-white border border-gray-200 rounded focus:ring-2 focus:ring-gray-900"
                              step="0.01"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">LKR {item.price}</span>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Total */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Total:</span>
                          <span className="text-sm font-bold text-gray-900">
                            LKR {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
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
              <p className="text-4xl font-light text-gray-900">LKR {calculateTotal().toLocaleString()}</p>
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
                disabled={!formData.customer || formData.items.length === 0 || createInvoiceMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>

        {/* New Supplier Modal */}
        {showNewSupplierForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Supplier</h3>
                <button
                  type="button"
                  onClick={() => setShowNewSupplierForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="Enter supplier name"
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    placeholder="Enter address"
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewSupplierForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addNewSupplier}
                  disabled={!newSupplier.name || !newSupplier.phone}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Item Modal */}
        {showNewItemForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Custom Item</h3>
                <button
                  type="button"
                  onClick={() => setShowNewItemForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Enter item name"
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="Enter price"
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-900 focus:bg-white"
                  >
                    <option value="pack">Pack</option>
                    <option value="bottle">Bottle</option>
                    <option value="box">Box</option>
                    <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewItemForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addNewItem}
                  disabled={!newItem.name || !newItem.price}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
