const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../config/multer');

// All voucher routes require authentication
router.use(authenticate);

// 1. Dashboard statistics (returns role-specific data for Employee, Director, Accounts)
router.get('/dashboard', voucherController.getDashboardStats);

// 2. Voucher Listing & Details
// GET /api/vouchers (Employees get own, Director & Accounts get all + search/filter)
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);

// 3. Employee Actions
// Create new voucher (Draft or Submit)
router.post(
  '/',
  authorizeRoles('EMPLOYEE'),
  upload.single('signature'),
  voucherController.createVoucher
);

// Edit Draft voucher
router.put(
  '/:id',
  authorizeRoles('EMPLOYEE'),
  upload.single('signature'),
  voucherController.updateDraftVoucher
);

// Submit Draft voucher for approval
router.post(
  '/:id/submit',
  authorizeRoles('EMPLOYEE'),
  upload.single('signature'),
  voucherController.submitVoucher
);

// Delete Draft voucher
router.delete(
  '/:id',
  authorizeRoles('EMPLOYEE'),
  voucherController.deleteDraftVoucher
);

// 4. Director Actions
// Approve voucher
router.post(
  '/:id/approve',
  authorizeRoles('DIRECTOR'),
  upload.single('signature'),
  voucherController.approveVoucher
);

// Reject voucher
router.post(
  '/:id/reject',
  authorizeRoles('DIRECTOR'),
  voucherController.rejectVoucher
);

module.exports = router;
