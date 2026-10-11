import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
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
  'ALL',
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

const STATUSES = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED'
];

const VoucherFilterBar = ({ filters, onFilterChange, onReset, isEmployee = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const hasActiveFilters = 
    Boolean(filters.search) ||
    Boolean(filters.voucherNumber) ||
    Boolean(filters.employeeName) ||
    (filters.department && filters.department !== 'ALL') ||
    (filters.expenseCategory && filters.expenseCategory !== 'ALL') ||
    (filters.status && filters.status !== 'ALL') ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    Boolean(filters.minAmount) ||
    Boolean(filters.maxAmount);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 mb-6 space-y-4">
      
      {/* Primary Search & Fast Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Universal Search Bar */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by Voucher #, Title, Department, or Person..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-44">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-44 flex items-center gap-1.5">
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
          >
            <option value="createdAt">Date Created</option>
            <option value="expenseDate">Expense Date</option>
            <option value="amount">Amount</option>
            <option value="voucherNumber">Voucher #</option>
            <option value="status">Status</option>
          </select>
          <button
            type="button"
            onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort Order: ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowUpDown size={16} />
          </button>
        </div>

        {/* Toggle Advanced Filters */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-all ${
            showAdvanced || hasActiveFilters
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter size={15} />
          <span>Filters</span>
          {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            title="Reset All Filters"
            className="p-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center justify-center"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Advanced Filter Expansion (Bonus Point Features) */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          
          {/* Specific Voucher Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Voucher Number
            </label>
            <input
              type="text"
              placeholder="e.g. EV-202610-0001"
              value={filters.voucherNumber || ''}
              onChange={(e) => handleChange('voucherNumber', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Employee Name (if not employee) */}
          {!isEmployee && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={filters.employeeName || ''}
                onChange={(e) => handleChange('employeeName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Department
            </label>
            <select
              value={filters.department || 'ALL'}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Expense Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Expense Category
            </label>
            <select
              value={filters.expenseCategory || 'ALL'}
              onChange={(e) => handleChange('expenseCategory', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Range: Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Expense Date From
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Date Range: End Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Expense Date To
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Amount Range: Min */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Min Amount (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAmount || ''}
              onChange={(e) => handleChange('minAmount', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Amount Range: Max */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Max Amount (₹)
            </label>
            <input
              type="number"
              placeholder="50000"
              value={filters.maxAmount || ''}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default VoucherFilterBar;
