import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherService } from '../api/voucherService';
import StatusBadge from '../components/StatusBadge';
import DirectorReviewModal from '../components/DirectorReviewModal';
import VoucherPrintModal from '../components/VoucherPrintModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Printer,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [reviewVoucher, setReviewVoucher] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [printVoucher, setPrintVoucher] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (val) => {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDirectorAction = async (payload) => {
    if (reviewAction === 'approve') {
      const form = new FormData();
      if (payload.signature) form.append('signature', payload.signature);
      if (payload.signatureData) form.append('signatureData', payload.signatureData);
      await voucherService.approveVoucher(reviewVoucher.id, form);
    } else {
      await voucherService.rejectVoucher(reviewVoucher.id, payload);
    }
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-3">
            <span>{user.role} WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-sm text-indigo-100 mt-1 max-w-xl">
            {user.role === 'EMPLOYEE' &&
              'Manage your expense claims, track reimbursement approvals, and submit vouchers effortlessly.'}
            {user.role === 'DIRECTOR' &&
              'Review pending voucher claims, inspect employee expense breakdowns, and authorize approvals.'}
            {user.role === 'ACCOUNTS' &&
              'Monitor organization-wide expense disbursements, verify manager signatures, and process reimbursements.'}
          </p>
        </div>

        {user.role === 'EMPLOYEE' && (
          <Link
            to="/vouchers/new"
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Create Expense Voucher</span>
          </Link>
        )}

        {user.role === 'DIRECTOR' && (
          <Link
            to="/vouchers/pending"
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-2xl shadow-lg transition-all"
          >
            <Clock size={18} />
            <span>Review Pending ({stats?.pendingApprovalCount || 0})</span>
          </Link>
        )}

        {user.role === 'ACCOUNTS' && (
          <Link
            to="/vouchers?status=APPROVED"
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-2xl shadow-lg transition-all"
          >
            <CheckCircle2 size={18} />
            <span>Process Reimbursements</span>
          </Link>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. EMPLOYEE DASHBOARD CARDS */}
      {/* ======================================================== */}
      {user.role === 'EMPLOYEE' && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
                <Layers size={18} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalVouchers}</p>
              <span className="text-[11px] text-slate-400">All submissions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
                <FileEdit size={18} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.draftVouchers}</p>
              <span className="text-[11px] text-slate-400">Editable vouchers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                <Clock size={18} className="text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-900">{stats.pendingApproval}</p>
              <span className="text-[11px] text-amber-700/80">Awaiting Director</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">{stats.approvedVouchers}</p>
              <span className="text-[11px] text-emerald-700/80">Ready for payment</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
              <div className="flex items-center justify-between text-rose-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
                <XCircle size={18} className="text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-900">{stats.rejectedVouchers}</p>
              <span className="text-[11px] text-rose-700/80">With remarks</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm bg-indigo-50/20">
              <div className="flex items-center justify-between text-indigo-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Claimed</span>
                <DollarSign size={18} className="text-indigo-600" />
              </div>
              <p className="text-xl font-bold text-indigo-950 truncate">{formatCurrency(stats.totalAmountClaimed)}</p>
              <span className="text-[11px] text-indigo-700/80">Approved total</span>
            </div>

          </div>

          {/* Recent Vouchers Section */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Recent Vouchers</h2>
                <p className="text-xs text-slate-500">Latest expense claims submitted or drafted by you</p>
              </div>
              <Link
                to="/vouchers"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All ({stats.totalVouchers})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Voucher #</th>
                    <th className="px-6 py-3.5">Expense Title</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Expense Date</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentVouchers && stats.recentVouchers.length > 0 ? (
                    stats.recentVouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                          {v.voucherNumber}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {v.expenseTitle}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {v.expenseCategory}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(v.expenseDate)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {formatCurrency(v.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={v.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/vouchers/${v.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        No expense vouchers created yet. Click "+ Create Expense Voucher" to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. DIRECTOR DASHBOARD CARDS */}
      {/* ======================================================== */}
      {user.role === 'DIRECTOR' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
              <div className="flex items-center justify-between text-amber-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Approval</span>
                <Clock size={20} className="text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-amber-950">{stats.pendingApprovalCount}</p>
              <span className="text-xs text-amber-800/80 mt-1 block">Requires your review</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/30">
              <div className="flex items-center justify-between text-emerald-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Approved Today</span>
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-950">{stats.approvedToday}</p>
              <span className="text-xs text-emerald-800/80 mt-1 block">Authorized by you today</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/30">
              <div className="flex items-center justify-between text-rose-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Rejected Today</span>
                <XCircle size={20} className="text-rose-600" />
              </div>
              <p className="text-3xl font-extrabold text-rose-950">{stats.rejectedToday}</p>
              <span className="text-xs text-rose-800/80 mt-1 block">Returned with feedback</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm bg-indigo-50/30">
              <div className="flex items-center justify-between text-indigo-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total Pending Amount</span>
                <TrendingUp size={20} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-extrabold text-indigo-950">{formatCurrency(stats.totalPendingAmount)}</p>
              <span className="text-xs text-indigo-800/80 mt-1 block">Pending liability</span>
            </div>

          </div>

          {/* Recent Voucher Activity Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Voucher Activity</h2>
                <p className="text-xs text-slate-500">Live feed of organization-wide expense requests</p>
              </div>
              <Link
                to="/vouchers"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All Organization Vouchers</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Voucher #</th>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Expense Title</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Director Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentVoucherActivity && stats.recentVoucherActivity.length > 0 ? (
                    stats.recentVoucherActivity.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                          {v.voucherNumber}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {v.employeeName}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {v.department}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {v.expenseTitle}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {formatCurrency(v.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={v.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/vouchers/${v.id}`}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                            >
                              Details
                            </Link>
                            {v.status === 'SUBMITTED' && (
                              <>
                                <button
                                  onClick={() => {
                                    setReviewVoucher(v);
                                    setReviewAction('approve');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewVoucher(v);
                                    setReviewAction('reject');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        No activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 3. ACCOUNTS DASHBOARD CARDS */}
      {/* ======================================================== */}
      {user.role === 'ACCOUNTS' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Vouchers</span>
                <Layers size={18} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalVouchers}</p>
              <span className="text-[11px] text-slate-400">Organization-wide</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Approval</span>
                <Clock size={18} className="text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-900">{stats.pendingApproval}</p>
              <span className="text-[11px] text-amber-700/80">Awaiting Director</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">{stats.approvedVouchers}</p>
              <span className="text-[11px] text-emerald-700/80">Authorized for pay</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
              <div className="flex items-center justify-between text-rose-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
                <XCircle size={18} className="text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-900">{stats.rejectedVouchers}</p>
              <span className="text-[11px] text-rose-700/80">Closed without pay</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm bg-indigo-50/20">
              <div className="flex items-center justify-between text-indigo-700 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved Amount</span>
                <DollarSign size={18} className="text-indigo-600" />
              </div>
              <p className="text-xl font-bold text-indigo-950 truncate">
                {formatCurrency(stats.totalApprovedExpenseAmount)}
              </p>
              <span className="text-[11px] text-indigo-700/80">Reimbursement pool</span>
            </div>

          </div>

          {/* Recent Approved Vouchers Section */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Approved Vouchers</h2>
                <p className="text-xs text-slate-500">
                  Approved by Director with valid signatures ready for Accounts disbursement
                </p>
              </div>
              <Link
                to="/vouchers?status=APPROVED"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All Approved</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Voucher #</th>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Expense Title</th>
                    <th className="px-6 py-3.5">Approval Date</th>
                    <th className="px-6 py-3.5 text-right">Approved Amount</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentApprovedVouchers && stats.recentApprovedVouchers.length > 0 ? (
                    stats.recentApprovedVouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                          {v.voucherNumber}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {v.employeeName}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {v.department}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {v.expenseTitle}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(v.approvalDate)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-700">
                          {formatCurrency(v.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/vouchers/${v.id}`}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => setPrintVoucher(v)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                              <Printer size={13} />
                              <span>Print Voucher</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        No approved vouchers awaiting accounts processing at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Director Review Modal */}
      {reviewVoucher && reviewAction && (
        <DirectorReviewModal
          voucher={reviewVoucher}
          action={reviewAction}
          savedDirectorSignature={user?.signatureUrl}
          onClose={() => {
            setReviewVoucher(null);
            setReviewAction(null);
          }}
          onConfirm={handleDirectorAction}
        />
      )}

      {/* Accounts / Print Voucher Modal */}
      {printVoucher && (
        <VoucherPrintModal
          voucher={printVoucher}
          onClose={() => setPrintVoucher(null)}
        />
      )}

    </div>
  );
};

export default Dashboard;
