import { forwardRef } from 'react';
import { format } from 'date-fns';

const InvoiceTemplate = forwardRef(({ invoice }, ref) => {
  const {
    bill_number,
    invoice_date,
    due_date,
    clinic_name,
    clinic_address,
    clinic_phone,
    clinic_email,
    patient_name,
    patient_phone,
    patient_email,
    patient_address,
    patient_code,
    customer_name,
    customer_phone,
    customer_email,
    customer_address,
    customer_gstin,
    items = [],
    consultation_fee,
    medicine_cost,
    additional_charges,
    discount,
    tax,
    total,
    payment_status,
    payment_method,
    payment_date,
    notes,
    terms_and_conditions
  } = invoice;

  const customerName = customer_name || patient_name;
  const customerPhone = customer_phone || patient_phone;
  const customerEmail = customer_email || patient_email;
  const customerAddress = customer_address || patient_address;

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getPaymentStatusColor = () => {
    switch (payment_status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'partial':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white p-12 shadow-2xl max-w-5xl mx-auto"
      style={{
        fontFamily: 'Georgia, serif',
        minHeight: '11in'
      }}
    >
      {/* Luxury Header with Gold Accent */}
      <div className="border-b-4 border-yellow-600 pb-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>
              INVOICE
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"></div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">{bill_number}</div>
            <div className="text-sm text-gray-600 mt-1">
              Date: {format(new Date(invoice_date), 'MMM dd, yyyy')}
            </div>
            {due_date && (
              <div className="text-sm text-gray-600">
                Due: {format(new Date(due_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* From & To Section */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        {/* From */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            From
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{clinic_name}</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{clinic_address}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{clinic_phone}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{clinic_email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* To */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Bill To
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{customerName}</h2>
            {patient_code && (
              <div className="text-sm text-gray-600 mb-3">Patient ID: {patient_code}</div>
            )}
            <div className="space-y-2 text-gray-700">
              {customerAddress && (
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{customerAddress}</span>
                </div>
              )}
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{customerPhone}</span>
              </div>
              {customerEmail && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{customerEmail}</span>
                </div>
              )}
              {customer_gstin && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2">GSTIN:</span>
                  <span>{customer_gstin}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="mb-10">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
              <th className="py-4 px-6 text-left font-semibold">#</th>
              <th className="py-4 px-6 text-left font-semibold">Item Description</th>
              <th className="py-4 px-6 text-right font-semibold">Qty</th>
              <th className="py-4 px-6 text-right font-semibold">Price</th>
              <th className="py-4 px-6 text-right font-semibold">Discount</th>
              <th className="py-4 px-6 text-right font-semibold">Tax</th>
              <th className="py-4 px-6 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-4 px-6 border-b border-gray-200">{index + 1}</td>
                <td className="py-4 px-6 border-b border-gray-200">
                  <div className="font-semibold text-gray-900">{item.item_name}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                  {item.sanskrit_name && (
                    <div className="text-sm italic text-gray-500">{item.sanskrit_name}</div>
                  )}
                </td>
                <td className="py-4 px-6 border-b border-gray-200 text-right">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-4 px-6 border-b border-gray-200 text-right">
                  {formatCurrency(item.price_per_unit)}
                </td>
                <td className="py-4 px-6 border-b border-gray-200 text-right">
                  {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                </td>
                <td className="py-4 px-6 border-b border-gray-200 text-right">
                  {item.tax_percentage > 0 ? `${item.tax_percentage}%` : '-'}
                </td>
                <td className="py-4 px-6 border-b border-gray-200 text-right font-semibold">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-10">
        <div className="w-96">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {parseFloat(consultation_fee) > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Consultation Fee:</span>
                <span className="font-semibold">{formatCurrency(consultation_fee)}</span>
              </div>
            )}
            {parseFloat(medicine_cost) > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Medicines:</span>
                <span className="font-semibold">{formatCurrency(medicine_cost)}</span>
              </div>
            )}
            {parseFloat(additional_charges) > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Additional Charges:</span>
                <span className="font-semibold">{formatCurrency(additional_charges)}</span>
              </div>
            )}
            {parseFloat(discount) > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">- {formatCurrency(discount)}</span>
              </div>
            )}
            {parseFloat(tax) > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Tax:</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="border-t-2 border-gray-300 mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mb-8">
        <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${getPaymentStatusColor()}`}>
          <span className="text-sm font-bold uppercase tracking-wider">
            Payment Status: {payment_status}
          </span>
        </div>
        {payment_method && (
          <div className="mt-2 text-gray-700">
            Payment Method: <span className="font-semibold capitalize">{payment_method}</span>
          </div>
        )}
        {payment_date && (
          <div className="mt-1 text-gray-700">
            Payment Date: <span className="font-semibold">{format(new Date(payment_date), 'MMM dd, yyyy')}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-600 rounded">
          <h3 className="font-bold text-gray-900 mb-2">Notes:</h3>
          <p className="text-gray-700">{notes}</p>
        </div>
      )}

      {/* Terms and Conditions */}
      {terms_and_conditions && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions:</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{terms_and_conditions}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="flex justify-between">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 w-48 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Customer Signature</div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 w-48 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Authorized Signature</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Thank you for your business!
        </p>
        <p className="text-xs text-gray-500 mt-2">
          This is a computer-generated invoice and requires no signature.
        </p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
