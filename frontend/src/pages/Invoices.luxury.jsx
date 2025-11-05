import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, DollarSign, TrendingUp, TrendingDown,
  FileText, CheckCircle, Clock, XCircle, Calendar,
  Download, Eye, Send, CreditCard, Wallet
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

export default function InvoicesLuxury() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invoices', search, statusFilter, dateFilter],
    queryFn: async () => {
      const response = await api.get('/invoices', {
        params: { search, status: statusFilter, date: dateFilter },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  const invoices = data?.invoices || [];

  // Calculate financial stats
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    const pendingAmount = invoices
      .filter(inv => inv.payment_status === 'pending')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    const overdueAmount = invoices
      .filter(inv => inv.payment_status === 'overdue')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const paidCount = invoices.filter(inv => inv.payment_status === 'paid').length;
    const pendingCount = invoices.filter(inv => inv.payment_status === 'pending').length;
    const overdueCount = invoices.filter(inv => inv.payment_status === 'overdue').length;
    
    return { 
      totalRevenue, 
      paidAmount, 
      pendingAmount, 
      overdueAmount,
      paidCount,
      pendingCount,
      overdueCount,
      total: invoices.length
    };
  }, [invoices]);

  const getStatusVariant = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'default'
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      overdue: XCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Invoices
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} • Financial overview
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <LuxuryButton onClick={() => {}} icon={Plus}>
            Create Invoice
          </LuxuryButton>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LuxuryStatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          trend="up"
          trendValue="+12%"
          gradient="from-green-50 to-emerald-50"
          iconColor="text-green-600"
        />
        <LuxuryStatsCard
          icon={CheckCircle}
          label="Paid"
          value={`₹${stats.paidAmount.toLocaleString()}`}
          gradient="from-blue-50 to-indigo-50"
          iconColor="text-blue-600"
        />
        <LuxuryStatsCard
          icon={Clock}
          label="Pending"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          gradient="from-orange-50 to-amber-50"
          iconColor="text-orange-600"
        />
        <LuxuryStatsCard
          icon={XCircle}
          label="Overdue"
          value={`₹${stats.overdueAmount.toLocaleString()}`}
          gradient="from-red-50 to-rose-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Revenue Breakdown */}
      <LuxuryCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.paidCount}</p>
            <p className="text-sm text-gray-600">Paid Invoices</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-2">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-2">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </LuxuryCard>

      {/* Filters */}
      <LuxuryCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <LuxurySearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number or patient name..."
              icon={Search}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
          </div>
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
            title="No invoices found"
            description={search || statusFilter || dateFilter ? 'Try adjusting your filters' : 'No invoices have been created yet'}
            action={!search && !statusFilter && !dateFilter ? {
              label: 'Create Invoice',
              onClick: () => {},
              icon: Plus
            } : undefined}
          />
        </LuxuryCard>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const StatusIcon = getStatusIcon(invoice.payment_status);
            
            return (
              <LuxuryCard key={invoice.id} className="group hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between gap-4">
                  {/* Invoice Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      invoice.payment_status === 'paid' ? 'bg-green-100' :
                      invoice.payment_status === 'pending' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      <StatusIcon className={`h-7 w-7 ${
                        invoice.payment_status === 'paid' ? 'text-green-600' :
                        invoice.payment_status === 'pending' ? 'text-orange-600' :
                        'text-red-600'
                      }`} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-gray-900">
                          Invoice #{invoice.invoice_number}
                        </h4>
                        <LuxuryBadge variant={getStatusVariant(invoice.payment_status)}>
                          {invoice.payment_status.toUpperCase()}
                        </LuxuryBadge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{invoice.patient_name}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{invoice.total_amount.toLocaleString()}
                      </p>
                      {invoice.payment_method && (
                        <p className="text-xs text-gray-500 capitalize mt-1">
                          {invoice.payment_method}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Invoice"
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
                    <button
                      onClick={() => {}}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Send Invoice"
                    >
                      <Send className="h-5 w-5 text-purple-600" />
                    </button>
                  </div>
                </div>

                {/* Payment Details (if paid) */}
                {invoice.payment_status === 'paid' && invoice.payment_date && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Paid on {new Date(invoice.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Overdue Warning */}
                {invoice.payment_status === 'overdue' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Payment overdue - Please follow up</span>
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
