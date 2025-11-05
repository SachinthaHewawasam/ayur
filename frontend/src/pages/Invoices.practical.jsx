import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, DollarSign, TrendingUp, TrendingDown,
  FileText, CheckCircle, Clock, XCircle, Calendar,
  Download, Eye, Send, ShoppingCart, Package, 
  ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard,
  PieChart, BarChart3, Receipt, Users, Pill
} from 'lucide-react';
import api from '../services/api';
import { 
  LuxuryCard, 
  LuxuryStatsCard, 
  LuxurySearchBar, 
  LuxuryButton, 
  LuxuryBadge,
  LuxuryEmptyState,
  LuxurySkeleton
} from '../components/ui/LuxuryComponents';

export default function InvoicesPractical() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'sales', 'purchases'
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invoices', search, typeFilter, statusFilter, dateFilter],
    queryFn: async () => {
      const response = await api.get('/invoices', {
        params: { search, type: typeFilter, status: statusFilter, date: dateFilter },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const invoices = data?.invoices || [];

  // Calculate comprehensive financial stats
  const stats = useMemo(() => {
    // Sales (Revenue)
    const salesInvoices = invoices.filter(inv => inv.type === 'sale' || !inv.type);
    const totalRevenue = salesInvoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const paidRevenue = salesInvoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const pendingRevenue = salesInvoices
      .filter(inv => inv.payment_status === 'pending')
      .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    
    // Purchases (Expenses)
    const purchaseInvoices = invoices.filter(inv => inv.type === 'purchase');
    const totalExpenses = purchaseInvoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const paidExpenses = purchaseInvoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    const pendingExpenses = purchaseInvoices
      .filter(inv => inv.payment_status === 'pending')
      .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
    
    // Profit
    const netProfit = paidRevenue - paidExpenses;
    const profitMargin = paidRevenue > 0 ? ((netProfit / paidRevenue) * 100).toFixed(1) : 0;
    
    // Outstanding
    const outstandingReceivables = pendingRevenue;
    const outstandingPayables = pendingExpenses;
    
    return { 
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      netProfit,
      profitMargin,
      outstandingReceivables,
      outstandingPayables,
      salesCount: salesInvoices.length,
      purchaseCount: purchaseInvoices.length
    };
  }, [invoices]);

  const getStatusVariant = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'default',
      partial: 'primary'
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      overdue: XCircle,
      cancelled: XCircle,
      partial: ArrowUpCircle
    };
    return icons[status] || Clock;
  };

  const getTypeIcon = (type) => {
    return type === 'purchase' ? ShoppingCart : Receipt;
  };

  const getTypeColor = (type) => {
    return type === 'purchase' 
      ? 'from-red-50 to-rose-50' 
      : 'from-green-50 to-emerald-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Financial Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track sales, purchases, and financial health
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <LuxuryButton 
            onClick={() => navigate('/invoices/new?type=purchase')} 
            icon={ShoppingCart}
            variant="secondary"
          >
            New Purchase
          </LuxuryButton>
          <LuxuryButton 
            onClick={() => navigate('/invoices/new?type=sale')} 
            icon={Plus}
          >
            New Sale
          </LuxuryButton>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LuxuryStatsCard
          icon={ArrowUpCircle}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          trend="up"
          trendValue="+12%"
          gradient="from-green-50 to-emerald-50"
          iconColor="text-green-600"
        />
        <LuxuryStatsCard
          icon={ArrowDownCircle}
          label="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          gradient="from-red-50 to-rose-50"
          iconColor="text-red-600"
        />
        <LuxuryStatsCard
          icon={TrendingUp}
          label="Net Profit"
          value={`₹${stats.netProfit.toLocaleString()}`}
          trend={stats.netProfit >= 0 ? 'up' : 'down'}
          trendValue={`${stats.profitMargin}% margin`}
          gradient="from-blue-50 to-indigo-50"
          iconColor="text-blue-600"
        />
        <LuxuryStatsCard
          icon={Wallet}
          label="Outstanding"
          value={`₹${stats.outstandingReceivables.toLocaleString()}`}
          gradient="from-orange-50 to-amber-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Quick Stats Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Breakdown */}
        <LuxuryCard className="bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowUpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue (Sales)</h3>
                <p className="text-sm text-gray-600">{stats.salesCount} invoices</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-green-700 mb-1">Received</p>
              <p className="text-2xl font-bold text-green-900">₹{stats.paidRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-orange-700 mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-900">₹{stats.pendingRevenue.toLocaleString()}</p>
            </div>
          </div>
        </LuxuryCard>

        {/* Expense Breakdown */}
        <LuxuryCard className="bg-gradient-to-br from-red-50 to-rose-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowDownCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Expenses (Purchases)</h3>
                <p className="text-sm text-gray-600">{stats.purchaseCount} bills</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-red-700 mb-1">Paid</p>
              <p className="text-2xl font-bold text-red-900">₹{stats.paidExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-orange-700 mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-900">₹{stats.pendingExpenses.toLocaleString()}</p>
            </div>
          </div>
        </LuxuryCard>
      </div>

      {/* Filters */}
      <LuxuryCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <LuxurySearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number, patient, or supplier..."
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-3 rounded-xl transition-all font-medium ${
                typeFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('sales')}
              className={`px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                typeFilter === 'sales'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Sales
            </button>
            <button
              onClick={() => setTypeFilter('purchases')}
              className={`px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                typeFilter === 'purchases'
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Purchases
            </button>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>
      </LuxuryCard>

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <LuxuryCard key={i}>
              <LuxurySkeleton count={2} />
            </LuxuryCard>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <LuxuryCard>
          <LuxuryEmptyState
            icon={FileText}
            title="No transactions found"
            description={search || statusFilter || dateFilter ? 'Try adjusting your filters' : 'Start by creating your first sale or purchase'}
            action={!search && !statusFilter && !dateFilter ? {
              label: 'Create Sale Invoice',
              onClick: () => navigate('/invoices/new?type=sale'),
              icon: Plus
            } : undefined}
          />
        </LuxuryCard>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const StatusIcon = getStatusIcon(invoice.payment_status);
            const TypeIcon = getTypeIcon(invoice.type);
            const isSale = invoice.type !== 'purchase';
            
            return (
              <LuxuryCard key={invoice.id} className="group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between gap-4">
                  {/* Type Indicator */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(invoice.type)} flex items-center justify-center shadow-lg`}>
                    <TypeIcon className={`h-8 w-8 ${isSale ? 'text-green-600' : 'text-red-600'}`} />
                  </div>

                  {/* Invoice Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">
                        {isSale ? 'SALE' : 'PURCHASE'} #{invoice.invoice_number}
                      </h4>
                      <LuxuryBadge variant={getStatusVariant(invoice.payment_status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {invoice.payment_status.toUpperCase()}
                      </LuxuryBadge>
                      {isSale && (
                        <LuxuryBadge variant="primary">
                          <ArrowUpCircle className="h-3 w-3 mr-1" />
                          REVENUE
                        </LuxuryBadge>
                      )}
                      {!isSale && (
                        <LuxuryBadge variant="danger">
                          <ArrowDownCircle className="h-3 w-3 mr-1" />
                          EXPENSE
                        </LuxuryBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {isSale ? invoice.patient_name : invoice.supplier_name || 'Supplier'}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(invoice.created_at || invoice.invoice_date).toLocaleDateString()}
                      </div>
                      {invoice.items_count && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {invoice.items_count} items
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${isSale ? 'text-green-600' : 'text-red-600'}`}>
                      {isSale ? '+' : '-'}₹{(invoice.total_amount || invoice.amount || 0).toLocaleString()}
                    </p>
                    {invoice.payment_method && (
                      <p className="text-xs text-gray-500 capitalize mt-1 flex items-center justify-end gap-1">
                        <CreditCard className="h-3 w-3" />
                        {invoice.payment_method}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5 text-blue-600" />
                    </Link>
                    <button
                      onClick={() => {}}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-5 w-5 text-green-600" />
                    </button>
                    {isSale && (
                      <button
                        onClick={() => {}}
                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Send to Patient"
                      >
                        <Send className="h-5 w-5 text-purple-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                {invoice.payment_status === 'paid' && invoice.payment_date && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {isSale ? 'Received' : 'Paid'} on {new Date(invoice.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {invoice.payment_status === 'partial' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <ArrowUpCircle className="h-4 w-4" />
                        <span>Partial payment received</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Balance: ₹{((invoice.total_amount || invoice.amount || 0) - (invoice.paid_amount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {invoice.payment_status === 'overdue' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>
                        {isSale ? 'Payment overdue - Follow up required' : 'Payment to supplier overdue'}
                      </span>
                    </div>
                  </div>
                )}
              </LuxuryCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
