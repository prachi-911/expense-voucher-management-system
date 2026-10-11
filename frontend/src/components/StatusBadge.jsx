import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = status ? status.toUpperCase() : 'DRAFT';

  const configs = {
    DRAFT: {
      label: 'Draft',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: FileEdit
    },
    SUBMITTED: {
      label: 'Pending Approval',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock
    },
    APPROVED: {
      label: 'Approved',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle
    }
  };

  const current = configs[normalized] || configs.DRAFT;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${sizeClasses[size] || sizeClasses.md} transition-all duration-150`}
    >
      <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
