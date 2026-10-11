import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voucherService } from '../api/voucherService';
import SignaturePad from '../components/SignaturePad';
import { 
  Receipt, 
  ArrowLeft, 
  Save, 
  Send, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  Building2, 
  Folder 
} from 'lucide-react';

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

const CreateVoucher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    department: user?.department || 'Engineering',
    expenseTitle: '',
    expenseCategory: 'Travel',
    expenseDescription: '',
    amount: ''
  });

  const [signatureData, setSignatureData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (targetStatus) => {
    setError('');

    // Form validations
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

    // Validation Rule: Signature mandatory before SUBMISSION
    if (targetStatus === 'SUBMITTED') {
      const hasSig =
        (signatureData && (signatureData.type === 'file' || signatureData.type === 'base64' || signatureData.type === 'saved')) ||
        user?.signatureUrl;
      if (!hasSig) {
        setError('Employee Signature is mandatory before submitting a voucher for approval. Please draw or upload your signature below.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('expenseDate', formData.expenseDate);
      payload.append('department', formData.department);
      payload.append('expenseTitle', formData.expenseTitle);
      payload.append('expenseCategory', formData.expenseCategory);
      payload.append('expenseDescription', formData.expenseDescription);
      payload.append('amount', formData.amount);
      payload.append('status', targetStatus);

      if (signatureData) {
        if (signatureData.type === 'file') {
          payload.append('signature', signatureData.file);
        } else if (signatureData.type === 'base64') {
          payload.append('signatureData', signatureData.data);
        } else if (signatureData.type === 'saved') {
          payload.append('signatureData', signatureData.data);
        }
      }

      const res = await voucherService.createVoucher(payload);
      if (res.success) {
        navigate(`/vouchers/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create voucher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/vouchers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Vouchers</span>
        </Link>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">
          Auto-Generated Voucher Number on Save
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
        
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            New Expense Reimbursement Voucher
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in expense particulars and upload your signature before submission.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Employee Meta Box (Read-Only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{user?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Employee ID</span>
              <span className="font-semibold text-slate-800 text-sm font-mono">
                {user?.employeeId || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Voucher Creation Date</span>
              <span className="font-semibold text-slate-800 text-sm">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Section 1: Department & Expense Date */}
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
                Expense Incurred Date <span className="text-rose-500">*</span>
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

          {/* Section 2: Expense Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expense Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="expenseTitle"
                required
                placeholder="e.g. Flight Tickets for Bangalore Tech Summit"
                value={formData.expenseTitle}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
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

          {/* Section 3: Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reimbursement Amount (₹) <span className="text-rose-500">*</span>
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
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expense Justification & Description
            </label>
            <textarea
              rows={3}
              name="expenseDescription"
              placeholder="Provide context, purpose, or additional invoice reference numbers..."
              value={formData.expenseDescription}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Section 5: Employee Signature */}
          <div className="pt-2 border-t border-slate-100">
            <SignaturePad
              label="Employee Signature (Mandatory before submission)"
              savedSignatureUrl={user?.signatureUrl}
              onChange={(sig) => setSignatureData(sig)}
            />
          </div>

          {/* Action Buttons: Save as Draft vs Submit for Approval */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              * Vouchers saved as Draft can be edited later. Once submitted, vouchers become read-only.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Save as Draft Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('DRAFT')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>Save as Draft</span>
              </button>

              {/* Submit for Approval Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('SUBMITTED')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
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

export default CreateVoucher;
