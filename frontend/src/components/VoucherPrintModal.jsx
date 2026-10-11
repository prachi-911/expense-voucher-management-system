import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

const VoucherPrintModal = ({ voucher, onClose }) => {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt || 0);
  };

  const getSignatureSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-slate-600" />
            <span className="font-semibold text-slate-800 text-sm">
              Official Expense Voucher Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE VOUCHER SHEET */}
        <div className="p-8 overflow-y-auto print-container bg-white text-slate-900 font-sans">
          
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                PRACHAY SECURITIES PVT. LTD.
              </h1>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
                Expense Reimbursement Voucher
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accounts & Finance Department • Internal Official Record
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg mb-2">
                <span className="text-xs text-slate-500 block uppercase font-bold">Voucher Number</span>
                <span className="text-base font-mono font-bold text-slate-900">
                  {voucher.voucherNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-medium">Date:</span> {formatDate(voucher.voucherDate || voucher.createdAt)}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-medium">Status:</span>{' '}
                <span className="font-bold uppercase tracking-wider">{voucher.status}</span>
              </p>
            </div>
          </div>

          {/* Section 1: Employee Particulars */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Employee Particulars
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Claimant Name</span>
                <span className="font-semibold text-slate-800">{voucher.employeeName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Employee ID</span>
                <span className="font-semibold text-slate-800">{voucher.employeeId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{voucher.department}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Expense Breakdown */}
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Expense Item Breakdown
            </h2>
            <table className="w-full text-sm border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase">
                  <th className="border border-slate-200 px-4 py-2.5">Expense Title & Description</th>
                  <th className="border border-slate-200 px-4 py-2.5">Category</th>
                  <th className="border border-slate-200 px-4 py-2.5">Expense Date</th>
                  <th className="border border-slate-200 px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 px-4 py-3 align-top">
                    <p className="font-semibold text-slate-900">{voucher.expenseTitle}</p>
                    {voucher.expenseDescription && (
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                        {voucher.expenseDescription}
                      </p>
                    )}
                  </td>
                  <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-700">
                    {voucher.expenseCategory}
                  </td>
                  <td className="border border-slate-200 px-4 py-3 align-top text-slate-700">
                    {formatDate(voucher.expenseDate)}
                  </td>
                  <td className="border border-slate-200 px-4 py-3 align-top text-right font-bold text-slate-900">
                    {formatCurrency(voucher.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-3 font-bold text-slate-900 text-right uppercase text-xs">
                    Total Reimbursement Claim:
                  </td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 text-right text-base">
                    {formatCurrency(voucher.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Rejection Remarks (If rejected) */}
          {voucher.status === 'REJECTED' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block mb-1">
                Rejection Remarks
              </span>
              <p className="text-sm text-rose-900">{voucher.rejectionReason}</p>
            </div>
          )}

          {/* Section 3: Official Signatures */}
          <div className="border border-slate-200 rounded-lg p-5 mt-6 bg-slate-50/50">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4 border-b border-slate-200 pb-1">
              Signatures & Authorizations
            </h2>
            <div className="grid grid-cols-2 gap-8">
              
              {/* Employee Signature */}
              <div className="border border-slate-200 bg-white rounded-lg p-3 text-center">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                  Claimant Signature
                </span>
                <div className="h-20 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded mb-2">
                  {voucher.employeeSignature ? (
                    <img
                      src={getSignatureSrc(voucher.employeeSignature)}
                      alt="Employee Signature"
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Signature Not Uploaded</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800">{voucher.employeeName}</p>
                <p className="text-[11px] text-slate-500">Date: {formatDate(voucher.voucherDate || voucher.createdAt)}</p>
              </div>

              {/* Director Signature */}
              <div className="border border-slate-200 bg-white rounded-lg p-3 text-center">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                  Director Approval
                </span>
                <div className="h-20 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded mb-2">
                  {voucher.directorSignature ? (
                    <img
                      src={getSignatureSrc(voucher.directorSignature)}
                      alt="Director Signature"
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {voucher.status === 'APPROVED' ? 'Approved (Digital)' : 'Pending Director Review'}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {voucher.approvedBy?.name || 'Director Authorization'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Date: {voucher.approvalDate ? formatDate(voucher.approvalDate) : 'Pending'}
                </p>
              </div>

            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 text-center border-t border-slate-200 pt-3 text-[11px] text-slate-400">
            This document is computer-generated from the Prachay Securities Expense Voucher Management System.
          </div>

        </div>

      </div>
    </div>
  );
};

export default VoucherPrintModal;
