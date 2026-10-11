import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherService } from '../api/voucherService';
import SignaturePad from '../components/SignaturePad';
import { ArrowLeft, Save, Send, AlertCircle, ShieldAlert, Receipt } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance & Accounts',
  'Executive Leadership',
  'Operations',
  'Customer Success'
];

const CATEGORIES = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Accommodation',
  'Utilities',
  'Software & Subscriptions',
  'Training & Development',
  'Client Entertainment',
  'General',
  'Other'
];

const EditVoucher = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [formData, setFormData] = useState({
    expenseDate: '',
    department: '',
    expenseTitle: '',
    expenseCategory: '',
    expenseDescription: '',
    amount: ''
  });

  const [signatureData, setSignatureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const res = await voucherService.getVoucherById(id);
        if (res.success && res.data) {
          const v = res.data;
          setVoucher(v);

          // Verify business rule: only DRAFT vouchers can be edited
          if (v.status !== 'DRAFT') {
            setError(`Voucher ${v.voucherNumber} is currently in '${v.status}' status and is read-only. It cannot be edited.`);
            return;
          }

          if (v.userId !== user?.id) {
            setError('Access Denied: You may only edit your own draft vouchers.');
            return;
          }

          setFormData({
            expenseDate: v.expenseDate ? new Date(v.expenseDate).toISOString().split('T')[0] : '',
            department: v.department || 'Engineering',
            expenseTitle: v.expenseTitle || '',
            expenseCategory: v.expenseCategory || 'Travel',
            expenseDescription: v.expenseDescription || '',
            amount: v.amount !== undefined ? v.amount : ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load voucher details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (submitAfterSave = false) => {
    setError('');

    if (!formData.department.trim()) {
      setError('Department is mandatory.');
      return;
    }
    if (!formData.expenseTitle.trim()) {
      setError('Expense Title is mandatory.');
      return;
    }
    if (!formData.expenseDate) {
      setError('Expense Date is mandatory.');
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('Amount is mandatory and must be greater than zero.');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('expenseDate', formData.expenseDate);
      payload.append('department', formData.department);
      payload.append('expenseTitle', formData.expenseTitle);
      payload.append('expenseCategory', formData.expenseCategory);
      payload.append('expenseDescription', formData.expenseDescription);
      payload.append('amount', formData.amount);

      if (signatureData) {
        if (signatureData.type === 'file') {
          payload.append('signature', signatureData.file);
        } else if (signatureData.type === 'base64' || signatureData.type === 'saved') {
          payload.append('signatureData', signatureData.data);
        }
      }

      await voucherService.updateDraftVoucher(id, payload);

      if (submitAfterSave) {
        // If submitting for approval, trigger submit endpoint
        const submitPayload = new FormData();
        if (signatureData) {
          if (signatureData.type === 'file') {
            submitPayload.append('signature', signatureData.file);
          } else if (signatureData.type === 'base64' || signatureData.type === 'saved') {
            submitPayload.append('signatureData', signatureData.data);
          }
        }
        await voucherService.submitVoucher(id, submitPayload);
      }

      navigate(`/vouchers/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update voucher.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !voucher) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Cannot Edit Voucher</h2>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Link
          to="/vouchers"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft size={16} />
          <span>Return to My Vouchers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          to={`/vouchers/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Cancel & View Voucher</span>
        </Link>
        <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-md font-bold">
          Editing Draft: {voucher?.voucherNumber}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
        
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Draft Voucher
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your expense claim details or submit for Director approval.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Department & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="expenseDate"
                required
                value={formData.expenseDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expense Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="expenseTitle"
                required
                value={formData.expenseTitle}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="expenseCategory"
                value={formData.expenseCategory}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Claim Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expense Description
            </label>
            <textarea
              rows={3}
              name="expenseDescription"
              value={formData.expenseDescription}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Signature */}
          <div className="pt-2 border-t border-slate-100">
            <SignaturePad
              label="Update Employee Signature"
              value={voucher?.employeeSignature}
              savedSignatureUrl={user?.signatureUrl}
              onChange={(sig) => setSignatureData(sig)}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              * Once submitted for approval, this voucher will become read-only.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(false)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>Save Draft Changes</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={16} />
                )}
                <span>Submit for Approval</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default EditVoucher;
