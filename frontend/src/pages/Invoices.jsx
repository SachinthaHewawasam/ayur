import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, TrendingUp, TrendingDown, Filter,
  ArrowUpCircle, ArrowDownCircle, Calendar, MoreVertical,
  Eye, Download, Send, CheckCircle, Clock, XCircle
} from 'lucide-react';
import api from '../services/api';

export default function InvoicesMinimalist() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sales', 'purchases'

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, activeTab],
    queryFn: async () => {
      const response = await api.get('/invoices', {
        params: { 
          search, 
          invoice_type: activeTab === 'all' ? '' : (activeTab === 'sales' ? 'retail' : 'purchase')
        },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const invoices = data?.invoices || [];

  // Calculate stats
  const stats = useMemo(() => {
    const sales = invoices.filter(inv => inv.invoice_type === 'retail');
    const purchases = invoices.filter(inv => inv.invoice_type === 'purchase');
    
    const revenue = sales.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const expenses = purchases.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const profit = revenue - expenses;
    
    return { revenue, expenses, profit, salesCount: sales.length, purchaseCount: purchases.length };
  }, [invoices]);

  const getStatusColor = (status) => {
    const colors = {
      paid: 'text-emerald-600 bg-emerald-50',
      pending: 'text-amber-600 bg-amber-50',
      overdue: 'text-rose-600 bg-rose-50',
      partial: 'text-blue-600 bg-blue-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalist Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">Invoices</h1>
              <p className="text-sm text-gray-500 mt-1">Financial overview and management</p>
            </div>
            <button
              onClick={() => navigate('/invoices/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Minimalist Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Revenue</p>
            <p className="text-3xl font-light text-gray-900">LKR {stats.revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">{stats.salesCount} invoices</p>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <ArrowDownCircle className="h-5 w-5 text-rose-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {stats.purchaseCount}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Expenses</p>
            <p className="text-3xl font-light text-gray-900">LKR {stats.expenses.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">{stats.purchaseCount} bills</p>
          </div>

          {/* Profit */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Net Profit</p>
            <p className={`text-3xl font-light ${stats.profit >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
              LKR {stats.profit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-2">Profit margin</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'sales'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'purchases'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Purchases
              </button>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by creating your first invoice</p>
            <button
              onClick={() => navigate('/invoices/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const isSale = invoice.type !== 'purchase';
              const amount = invoice.total_amount || invoice.amount || 0;
              
              return (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  className="block bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    {/* Left side */}
                    <div className="flex items-center gap-6 flex-1">
                      {/* Type indicator */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSale ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}>
                        {isSale ? (
                          <ArrowUpCircle className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <ArrowDownCircle className="h-6 w-6 text-rose-600" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-medium text-gray-900">
                            #{invoice.invoice_number}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(invoice.payment_status)}`}>
                            {invoice.payment_status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{isSale ? invoice.patient_name : invoice.supplier_name || 'Supplier'}</span>
                          <span>•</span>
                          <span>{new Date(invoice.created_at || invoice.invoice_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-2xl font-light ${isSale ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isSale ? '+' : '-'}LKR {amount.toLocaleString()}
                        </p>
                        {invoice.payment_method && (
                          <p className="text-xs text-gray-400 mt-1 capitalize">{invoice.payment_method}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); }}
                          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); }}
                          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
