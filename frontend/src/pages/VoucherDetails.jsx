import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherService } from '../api/voucherService';
import StatusBadge from '../components/StatusBadge';
import DirectorReviewModal from '../components/DirectorReviewModal';
import VoucherPrintModal from '../components/VoucherPrintModal';
import {
  ArrowLeft,
  FileEdit,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Printer,
  Calendar,
  Building2,
  Tag,
  User,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  FileCheck,
  Clock
} from 'lucide-react';

const VoucherDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Actions
  const [reviewAction, setReviewAction] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await voucherService.getVoucherById(id);
      if (res.success) {
        setVoucher(res.data);
      }
    } catch (err) {
      console.error('Error fetching voucher:', err);
      setError(err.response?.data?.message || 'Failed to load voucher details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

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

  const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSignatureSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:5000${url}`;
  };

  // Submit Draft Voucher
  const handleSubmitDraft = async () => {
    if (!voucher.employeeSignature && !user.signatureUrl) {
      alert('An employee signature is required before submitting. Please edit the draft to attach your signature.');
      navigate(`/vouchers/${id}/edit`);
      return;
    }

    setSubmittingAction(true);
    try {
      await voucherService.submitVoucher(id, {});
      fetchVoucher();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit voucher.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete Draft Voucher
  const handleDeleteDraft = async () => {
    setSubmittingAction(true);
    try {
      await voucherService.deleteDraftVoucher(id);
      navigate('/vouchers');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voucher.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Director Approve / Reject Confirm
  const handleDirectorReview = async (payload) => {
    if (reviewAction === 'approve') {
      const form = new FormData();
      if (payload.signature) form.append('signature', payload.signature);
      if (payload.signatureData) form.append('signatureData', payload.signatureData);
      await voucherService.approveVoucher(id, form);
    } else {
      await voucherService.rejectVoucher(id, payload);
    }
    fetchVoucher();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Voucher Not Found or Restricted</h2>
        <p className="text-slate-600 text-sm mb-6">{error || 'This voucher does not exist or you lack permission to view it.'}</p>
        <Link
          to="/vouchers"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft size={16} />
          <span>Back to Vouchers</span>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === voucher.userId;
  const isDraft = voucher.status === 'DRAFT';
  const isSubmitted = voucher.status === 'SUBMITTED';
  const isApproved = voucher.status === 'APPROVED';
  const isRejected = voucher.status === 'REJECTED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Navigation & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/vouchers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to All Vouchers</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Print / Save PDF Receipt */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>

          {/* Employee Draft Actions */}
          {user.role === 'EMPLOYEE' && isOwner && isDraft && (
            <>
              <Link
                to={`/vouchers/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <FileEdit size={15} />
                <span>Edit Draft</span>
              </Link>

              <button
                onClick={handleSubmitDraft}
                disabled={submittingAction}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                <Send size={15} />
                <span>Submit for Approval</span>
              </button>

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </>
          )}

          {/* Director Review Actions */}
          {user.role === 'DIRECTOR' && isSubmitted && (
            <>
              <button
                onClick={() => setReviewAction('approve')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <CheckCircle2 size={16} />
                <span>Approve Voucher</span>
              </button>

              <button
                onClick={() => setReviewAction('reject')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <XCircle size={16} />
                <span>Reject Voucher</span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* Rejection Alert Banner (if rejected) */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm flex items-start gap-3.5">
          <XCircle className="text-rose-600 shrink-0 mt-0.5" size={22} />
          <div className="text-sm">
            <h3 className="font-bold text-rose-950">Voucher Rejected by Director</h3>
            <p className="text-xs text-rose-800 mt-0.5 font-semibold">
              Reason Provided:
            </p>
            <p className="text-xs text-rose-900 mt-1 bg-white/70 p-3 rounded-xl border border-rose-200 font-mono leading-relaxed">
              {voucher.rejectionReason || 'No specific remarks given.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Voucher Sheet Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {voucher.voucherNumber}
              </h1>
              <StatusBadge status={voucher.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created on {formatDate(voucher.voucherDate || voucher.createdAt)} • Department: <span className="font-semibold text-slate-700">{voucher.department}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Claim Amount
            </span>
            <span className="text-3xl font-black text-indigo-900">
              {formatCurrency(voucher.amount)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: Basic Information */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Receipt size={15} />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Expense Title</span>
                <span className="font-bold text-slate-900 text-sm leading-snug">{voucher.expenseTitle}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Expense Category</span>
                <span className="font-semibold text-slate-800 text-sm">{voucher.expenseCategory}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Expense Incurred Date</span>
                <span className="font-semibold text-slate-800 text-sm">{formatDate(voucher.expenseDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Department</span>
                <span className="font-semibold text-slate-800 text-sm">{voucher.department}</span>
              </div>
            </div>

            {/* Description */}
            {voucher.expenseDescription && (
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Expense Description & Justification:
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {voucher.expenseDescription}
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Employee Information */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <User size={15} />
              <span>Employee Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Employee Name</span>
                <span className="font-bold text-slate-900 text-sm">{voucher.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Employee ID</span>
                <span className="font-semibold text-slate-800 text-sm font-mono">
                  {voucher.employeeId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Employee Email</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {voucher.user?.email || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Signatures & Authorizations */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <ShieldCheck size={15} />
              <span>Official Signatures & Approval Verification</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Employee Signature Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Claimant Signature
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(voucher.voucherDate || voucher.createdAt)}
                    </span>
                  </div>
                  
                  <div className="h-28 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2">
                    {voucher.employeeSignature ? (
                      <img
                        src={getSignatureSrc(voucher.employeeSignature)}
                        alt="Employee Signature"
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Signature Not Attached
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{voucher.employeeName}</span>
                  <span className="text-slate-400 font-mono">{voucher.employeeId || 'Claimant'}</span>
                </div>
              </div>

              {/* Director Signature Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Director Approval Signature
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {voucher.approvalDate ? formatDate(voucher.approvalDate) : 'Pending Review'}
                    </span>
                  </div>

                  <div className="h-28 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2">
                    {voucher.directorSignature ? (
                      <img
                        src={getSignatureSrc(voucher.directorSignature)}
                        alt="Director Signature"
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <Clock size={20} className="text-slate-300 mx-auto mb-1" />
                        <span className="text-xs text-slate-400 italic">
                          {isApproved
                            ? 'Approved via System'
                            : isRejected
                            ? 'Rejected (No Signature)'
                            : 'Awaiting Director Signature'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {voucher.approvedBy?.name || (isApproved ? 'Director' : 'Pending')}
                  </span>
                  <span className="text-slate-400">
                    {isApproved ? 'Authorized' : isRejected ? 'Rejected' : 'Under Review'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Audit Information */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span>Created: <span className="text-slate-600">{formatDateTime(voucher.createdAt)}</span></span>
            </div>
            <div>
              <span>Last Modified: <span className="text-slate-600">{formatDateTime(voucher.updatedAt)}</span></span>
            </div>
            {voucher.approvalDate && (
              <div>
                <span>Reviewed: <span className="text-slate-600">{formatDateTime(voucher.approvalDate)}</span></span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Delete Draft Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Draft Voucher?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to permanently delete this draft voucher? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDraft}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                {submittingAction && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Delete Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Director Review Modal */}
      {reviewAction && (
        <DirectorReviewModal
          voucher={voucher}
          action={reviewAction}
          savedDirectorSignature={user?.signatureUrl}
          onClose={() => setReviewAction(null)}
          onConfirm={handleDirectorReview}
        />
      )}

      {/* Print / Export Voucher Modal */}
      {showPrintModal && (
        <VoucherPrintModal
          voucher={voucher}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
};

export default VoucherDetails;
