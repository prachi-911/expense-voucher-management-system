import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VoucherList from './pages/VoucherList';
import VoucherDetails from './pages/VoucherDetails';
import CreateVoucher from './pages/CreateVoucher';
import EditVoucher from './pages/EditVoucher';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Common Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers"
                element={
                  <ProtectedRoute>
                    <VoucherList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers/:id"
                element={
                  <ProtectedRoute>
                    <VoucherDetails />
                  </ProtectedRoute>
                }
              />

              {/* Employee Dedicated Routes */}
              <Route
                path="/vouchers/new"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                    <CreateVoucher />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                    <EditVoucher />
                  </ProtectedRoute>
                }
              />

              {/* Director Dedicated Routes */}
              <Route
                path="/vouchers/pending"
                element={
                  <ProtectedRoute allowedRoles={['DIRECTOR']}>
                    <VoucherList
                      defaultStatusFilter="SUBMITTED"
                      pageTitle="Pending Voucher Approval Queue"
                    />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
