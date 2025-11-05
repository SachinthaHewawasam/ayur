import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import InvoiceTemplate from '../components/InvoiceTemplate';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    }
  });

  const invoice = data?.invoice;

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${invoice?.bill_number}`,
    onAfterPrint: () => toast.success('Invoice printed successfully')
  });

  const handleDownloadPDF = () => {
    // Trigger print dialog which can save as PDF
    handlePrint();
    toast.success('Use the print dialog to save as PDF');
  };

  const handleUpdatePayment = async (status) => {
    try {
      await api.put(`/invoices/${id}`, {
        payment_status: status,
        payment_date: status === 'paid' ? new Date().toISOString() : null
      });
      toast.success('Payment status updated');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 text-green-600 hover:text-green-700"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar - No Print */}
      <div className="bg-white shadow-md mb-6 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/invoices')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Invoices
            </button>

            <div className="flex items-center gap-3">
              {/* Payment Status Actions */}
              {invoice.payment_status === 'pending' && (
                <button
                  onClick={() => handleUpdatePayment('paid')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Mark as Paid
                </button>
              )}

              {invoice.payment_status === 'paid' && (
                <button
                  onClick={() => handleUpdatePayment('pending')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Mark as Pending
                </button>
              )}

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>

              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
        <InvoiceTemplate ref={invoiceRef} invoice={invoice} />
      </div>
    </div>
  );
}
