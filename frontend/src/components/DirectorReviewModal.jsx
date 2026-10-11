import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, AlertTriangle } from 'lucide-react';
import SignaturePad from './SignaturePad';

const DirectorReviewModal = ({ voucher, action, onClose, onConfirm, savedDirectorSignature }) => {
  const [signatureData, setSignatureData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!voucher || !action) return null;

  const isApprove = action === 'approve';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isApprove) {
      if (!signatureData) {
        setError('Director signature is mandatory before approving a voucher.');
        return;
      }
    } else {
      if (!rejectionReason.trim()) {
        setError('Rejection reason is mandatory when rejecting a voucher.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isApprove) {
        await onConfirm({
          signature: signatureData.type === 'file' ? signatureData.file : null,
          signatureData: signatureData.type !== 'file' ? signatureData.data : null
        });
      } else {
        await onConfirm({ rejectionReason: rejectionReason.trim() });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isApprove ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isApprove ? (
              <CheckCircle2 className="text-emerald-600" size={22} />
            ) : (
              <XCircle className="text-rose-600" size={22} />
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isApprove ? 'Approve Expense Voucher' : 'Reject Expense Voucher'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {voucher.voucherNumber} • {voucher.employeeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Expense Title:</span>
              <span className="font-semibold text-slate-900">{voucher.expenseTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Claim Amount:</span>
              <span className="font-bold text-slate-900">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(voucher.amount)}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* APPROVE: Require Director Signature */}
          {isApprove ? (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                As Director, your signature is required to authorize reimbursement for this voucher.
              </p>
              <SignaturePad
                label="Director Approval Signature"
                savedSignatureUrl={savedDirectorSignature}
                onChange={(sig) => setSignatureData(sig)}
              />
            </div>
          ) : (
            /* REJECT: Require Rejection Reason */
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Explain clearly why this voucher is rejected. The employee will see this feedback.
              </p>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Missing receipt attachment, expense exceeds department travel threshold..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-50`}
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{isApprove ? 'Confirm Approval' : 'Confirm Rejection'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default DirectorReviewModal;
