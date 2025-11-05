import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [invoiceType, setInvoiceType] = useState('retail');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    customer_gstin: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    consultation_fee: 0,
    additional_charges: 0,
    discount: 0,
    tax: 0,
    payment_status: 'pending',
    payment_method: '',
    notes: '',
    terms_and_conditions: 'Payment is due within 15 days.\nPlease make checks payable to the clinic.\nThank you for your business!'
  });

  const [items, setItems] = useState([
    {
      item_type: 'medicine',
      medicine_id: null,
      item_name: '',
      description: '',
      quantity: 1,
      unit: 'units',
      price_per_unit: 0,
      discount: 0,
      tax_percentage: 0
    }
  ]);

  // Search patients
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'search', searchPatient],
    queryFn: async () => {
      if (!searchPatient) return { patients: [] };
      const response = await api.get('/patients', {
        params: { search: searchPatient, limit: 10 }
      });
      return response.data;
    },
    enabled: showPatientSearch && searchPatient.length > 0
  });

  // Search medicines
  const { data: medicinesData } = useQuery({
    queryKey: ['medicines', 'active'],
    queryFn: async () => {
      const response = await api.get('/medicines', {
        params: { active_only: true }
      });
      return response.data;
    }
  });

  const patients = patientsData?.patients || [];
  const medicines = medicinesData?.data || [];

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      ...formData,
      customer_name: patient.name,
      customer_phone: patient.phone,
      customer_email: patient.email || '',
      customer_address: patient.address || ''
    });
    setShowPatientSearch(false);
    setSearchPatient('');
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_type: 'medicine',
        medicine_id: null,
        item_name: '',
        description: '',
        quantity: 1,
        unit: 'units',
        price_per_unit: 0,
        discount: 0,
        tax_percentage: 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If medicine is selected, populate details
    if (field === 'medicine_id' && value) {
      const medicine = medicines.find((m) => m.id === parseInt(value));
      if (medicine) {
        newItems[index].item_name = medicine.name;
        newItems[index].description = medicine.sanskrit_name || '';
        newItems[index].price_per_unit = parseFloat(medicine.price_per_unit);
        newItems[index].unit = medicine.unit;
      }
    }

    setItems(newItems);
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.price_per_unit;
    const discount = item.discount || 0;
    const tax = ((subtotal - discount) * (item.tax_percentage || 0)) / 100;
    return subtotal - discount + tax;
  };

  const calculateGrandTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const consultation = parseFloat(formData.consultation_fee) || 0;
    const additional = parseFloat(formData.additional_charges) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    return consultation + itemsTotal + additional - discount + tax;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.customer_name || !formData.customer_phone) {
      toast.error('Customer name and phone are required');
      return;
    }

    if (items.some((item) => !item.item_name || item.quantity <= 0 || item.price_per_unit <= 0)) {
      toast.error('Please fill all item details correctly');
      return;
    }

    try {
      const payload = {
        ...formData,
        patient_id: selectedPatient?.id || null,
        invoice_type: invoiceType,
        items: items.map((item) => ({
          ...item,
          medicine_id: item.medicine_id || null,
          quantity: parseFloat(item.quantity),
          price_per_unit: parseFloat(item.price_per_unit),
          discount: parseFloat(item.discount) || 0,
          tax_percentage: parseFloat(item.tax_percentage) || 0
        })),
        consultation_fee: parseFloat(formData.consultation_fee) || 0,
        additional_charges: parseFloat(formData.additional_charges) || 0,
        discount: parseFloat(formData.discount) || 0,
        tax: parseFloat(formData.tax) || 0
      };

      const response = await api.post('/invoices', payload);

      if (response.data.success) {
        toast.success('Invoice created successfully!');
        navigate(`/invoices/${response.data.invoice.id}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">Generate a professional invoice for your customers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Type */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Type</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="patient"
                checked={invoiceType === 'patient'}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">Patient Invoice</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="retail"
                checked={invoiceType === 'retail'}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">Retail Sale</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="wholesale"
                checked={invoiceType === 'wholesale'}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2">Wholesale</span>
            </label>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>

          {invoiceType === 'patient' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patient
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  onFocus={() => setShowPatientSearch(true)}
                  placeholder="Search by name, phone, or patient code..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                {selectedPatient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setFormData({
                        ...formData,
                        customer_name: '',
                        customer_phone: '',
                        customer_email: '',
                        customer_address: ''
                      });
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {showPatientSearch && patients.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.patient_code} - {patient.phone}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <input
                type="text"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GSTIN</label>
              <input
                type="text"
                value={formData.customer_gstin}
                onChange={(e) => setFormData({ ...formData, customer_gstin: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={formData.customer_address}
                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Dates */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Item Type
                    </label>
                    <select
                      value={item.item_type}
                      onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="medicine">Medicine</option>
                      <option value="consultation">Consultation</option>
                      <option value="treatment">Treatment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {item.item_type === 'medicine' && (
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Medicine
                      </label>
                      <select
                        value={item.medicine_id || ''}
                        onChange={(e) => handleItemChange(index, 'medicine_id', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="">Select a medicine...</option>
                        {medicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} - ₹{med.price_per_unit} ({med.quantity_stock} {med.unit} available)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      min="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price_per_unit}
                      onChange={(e) => handleItemChange(index, 'price_per_unit', e.target.value)}
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.tax_percentage}
                      onChange={(e) => handleItemChange(index, 'tax_percentage', e.target.value)}
                      min="0"
                      max="100"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md">
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Charges */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Charges</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consultation Fee
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Charges
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additional_charges}
                onChange={(e) => setFormData({ ...formData, additional_charges: e.target.value })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount</label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Grand Total:</span>
              <span className="text-3xl font-bold text-green-600">
                ₹{calculateGrandTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Select method...</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="mobile">Mobile Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Terms</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Terms & Conditions
              </label>
              <textarea
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
