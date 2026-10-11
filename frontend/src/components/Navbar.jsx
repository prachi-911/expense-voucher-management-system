import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Receipt, 
  LayoutDashboard, 
  FilePlus, 
  Files, 
  Clock, 
  LogOut, 
  User, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'DIRECTOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ACCOUNTS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Receipt size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">
                  ABC Company
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Expense Voucher Portal
                </span>
              </div>
            </NavLink>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>

              {user.role === 'EMPLOYEE' && (
                <>
                  <NavLink to="/vouchers/new" className={navLinkClass}>
                    <FilePlus size={16} />
                    <span>Create Voucher</span>
                  </NavLink>
                  <NavLink to="/vouchers" className={navLinkClass}>
                    <Files size={16} />
                    <span>My Vouchers</span>
                  </NavLink>
                </>
              )}

              {user.role === 'DIRECTOR' && (
                <>
                  <NavLink to="/vouchers/pending" className={navLinkClass}>
                    <Clock size={16} />
                    <span>Pending Approvals</span>
                  </NavLink>
                  <NavLink to="/vouchers" className={navLinkClass}>
                    <Files size={16} />
                    <span>All Vouchers</span>
                  </NavLink>
                </>
              )}

              {user.role === 'ACCOUNTS' && (
                <NavLink to="/vouchers" className={navLinkClass}>
                  <Files size={16} />
                  <span>All Vouchers</span>
                </NavLink>
              )}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  {user.department && <span>{user.department}</span>}
                  {user.employeeId && <span>• {user.employeeId}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
