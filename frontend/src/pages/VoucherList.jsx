import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherService } from '../api/voucherService';
import VoucherFilterBar from '../components/VoucherFilterBar';
import StatusBadge from '../components/StatusBadge';
import DirectorReviewModal from '../components/DirectorReviewModal';
import VoucherPrintModal from '../components/VoucherPrintModal';
import {
  FileText,
  Plus,
  Eye,
  FileEdit,
  Trash2,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Receipt
} from 'lucide-react';

const VoucherList = ({ defaultStatusFilter = null, pageTitle = null }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    voucherNumber: '',
    employeeName: '',
    department: 'ALL',
    expenseCategory: 'ALL',
    status: defaultStatusFilter || searchParams.get('status') || 'ALL',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [reviewVoucher, setReviewVoucher] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [printVoucher, setPrintVoucher] = useState(null);

  // Delete Draft Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await voucherService.getVouchers(filters);
      if (res.success) {
        setVouchers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
      setError(err.response?.data?.message || 'Failed to load vouchers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      voucherNumber: '',
      employeeName: '',
      department: 'ALL',
      expenseCategory: 'ALL',
      status: defaultStatusFilter || 'ALL',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await voucherService.deleteDraftVoucher(deleteTarget.id);
      setDeleteTarget(null);
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voucher.');
    } finally {
      setDeleting(false);
    }
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
    fetchVouchers();
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt || 0);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const title =
    pageTitle ||
    (defaultStatusFilter === 'SUBMITTED'
      ? 'Pending Voucher Approvals'
      : user.role === 'EMPLOYEE'
      ? 'My Expense Vouchers'
      : 'All Organization Vouchers');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user.role === 'EMPLOYEE'
              ? 'View and manage all your submitted and draft expense vouchers'
              : 'Search, filter, inspect and manage expense reimbursement requests across all departments'}
          </p>
        </div>

        {user.role === 'EMPLOYEE' && (
          <Link
            to="/vouchers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Create New Voucher</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar (Bonus Feature) */}
      <VoucherFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        isEmployee={user.role === 'EMPLOYEE'}
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Vouchers Data Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-medium">Filtering vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Receipt size={30} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Vouchers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              No expense vouchers match the selected criteria or search query.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Voucher #</th>
                  <th className="px-6 py-4">Expense Details</th>
                  {user.role !== 'EMPLOYEE' && <th className="px-6 py-4">Claimant</th>}
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Voucher # */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                      {v.voucherNumber}
                    </td>

                    {/* Expense Details */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-slate-900 leading-snug line-clamp-1">
                        {v.expenseTitle}
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {v.expenseCategory}
                      </span>
                    </td>

                    {/* Claimant (Non-Employee only) */}
                    {user.role !== 'EMPLOYEE' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800 text-xs">{v.employeeName}</p>
                        {v.employeeId && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {v.employeeId}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Department */}
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap font-medium">
                      {v.department}
                    </td>

                    {/* Expense Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(v.expenseDate)}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(v.amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <StatusBadge status={v.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Details (All roles) */}
                        <Link
                          to={`/vouchers/${v.id}`}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </Link>

                        {/* Employee Draft Actions: Edit & Delete */}
                        {user.role === 'EMPLOYEE' && v.status === 'DRAFT' && (
                          <>
                            <Link
                              to={`/vouchers/${v.id}/edit`}
                              title="Edit Draft"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <FileEdit size={16} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(v)}
                              title="Delete Draft"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}

                        {/* Director Actions: Quick Approve / Reject */}
                        {user.role === 'DIRECTOR' && v.status === 'SUBMITTED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setReviewVoucher(v);
                                setReviewAction('approve');
                              }}
                              title="Approve Voucher"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReviewVoucher(v);
                                setReviewAction('reject');
                              }}
                              title="Reject Voucher"
                              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {/* Accounts / Print Receipt (Bonus) */}
                        {(user.role === 'ACCOUNTS' || v.status === 'APPROVED') && (
                          <button
                            type="button"
                            onClick={() => setPrintVoucher(v)}
                            title="Print Voucher Receipt"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Printer size={16} />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing {vouchers.length} of {pagination.total} records (Page {pagination.page} of {pagination.totalPages})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Delete Draft Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Draft Voucher?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete draft <span className="font-mono font-bold text-slate-800">{deleteTarget.voucherNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Delete Draft</span>
              </button>
            </div>
          </div>
        </div>
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

      {/* Print Voucher Modal */}
      {printVoucher && (
        <VoucherPrintModal
          voucher={printVoucher}
          onClose={() => setPrintVoucher(null)}
        />
      )}

    </div>
  );
};

export default VoucherList;
