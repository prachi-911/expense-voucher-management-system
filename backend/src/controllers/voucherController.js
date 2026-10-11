const prisma = require('../config/db');
const { generateVoucherNumber } = require('../utils/voucherNumber');
const { saveBase64Image } = require('../config/multer');

/**
 * 1. Create a Voucher (EMPLOYEE)
 * Initially saved as DRAFT, or can be directly SUBMITTED if employee signature is provided.
 */
const createVoucher = async (req, res) => {
  try {
    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      status: requestedStatus,
      signatureData
    } = req.body;

    // Validate Mandatory Fields
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is mandatory.' });
    }
    if (!expenseTitle || !expenseTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is mandatory.' });
    }
    if (!expenseDate) {
      return res.status(400).json({ success: false, message: 'Expense date is mandatory.' });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: 'Amount is mandatory and must be a valid number.' });
    }
    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
    }

    // Determine initial status: default DRAFT, or SUBMITTED
    let targetStatus = 'DRAFT';
    if (requestedStatus === 'SUBMITTED') {
      targetStatus = 'SUBMITTED';
    }

    // Handle Employee Signature
    let employeeSignature = null;
    if (req.file) {
      employeeSignature = `/uploads/signatures/${req.file.filename}`;
    } else if (signatureData) {
      employeeSignature = saveBase64Image(signatureData, 'emp-sig');
    } else if (req.user.signatureUrl) {
      employeeSignature = req.user.signatureUrl;
    }

    // Validation Rule: Signature mandatory before submission
    if (targetStatus === 'SUBMITTED' && !employeeSignature) {
      return res.status(400).json({
        success: false,
        message: 'Employee signature is mandatory before submitting a voucher for approval.'
      });
    }

    // Generate unique Voucher Number
    const voucherNumber = await generateVoucherNumber();

    const voucher = await prisma.voucher.create({
      data: {
        voucherNumber,
        voucherDate: new Date(),
        expenseDate: new Date(expenseDate),
        department: department.trim(),
        expenseTitle: expenseTitle.trim(),
        expenseCategory: (expenseCategory || 'General').trim(),
        expenseDescription: expenseDescription ? expenseDescription.trim() : null,
        amount: parsedAmount,
        employeeName: req.user.name,
        employeeId: req.user.employeeId || null,
        employeeSignature,
        userId: req.user.id,
        status: targetStatus
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: targetStatus === 'SUBMITTED' 
        ? 'Voucher created and submitted for approval.' 
        : 'Voucher saved as draft.',
      data: voucher
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create voucher.',
      error: error.message
    });
  }
};

/**
 * 2. Get All Vouchers with Search, Filter & Sort
 * Role logic:
 * - EMPLOYEE: only their own vouchers
 * - DIRECTOR & ACCOUNTS: all vouchers across organization
 */
const getVouchers = async (req, res) => {
  try {
    const {
      search,
      voucherNumber,
      employeeName,
      department,
      expenseCategory,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    // Role-based visibility
    if (req.user.role === 'EMPLOYEE') {
      where.userId = req.user.id;
    }

    // Search query (matches voucherNumber, title, department, or employeeName)
    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { voucherNumber: { contains: s } },
        { expenseTitle: { contains: s } },
        { department: { contains: s } },
        { employeeName: { contains: s } },
        { expenseCategory: { contains: s } }
      ];
    }

    // Specific filters
    if (voucherNumber && voucherNumber.trim()) {
      where.voucherNumber = { contains: voucherNumber.trim() };
    }
    if (employeeName && employeeName.trim()) {
      where.employeeName = { contains: employeeName.trim() };
    }
    if (department && department.trim() && department !== 'ALL') {
      where.department = department.trim();
    }
    if (expenseCategory && expenseCategory.trim() && expenseCategory !== 'ALL') {
      where.expenseCategory = expenseCategory.trim();
    }
    if (status && status.trim() && status !== 'ALL') {
      where.status = status.toUpperCase().trim();
    }

    // Date Range filters
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    // Amount Range filters
    if (minAmount !== undefined && minAmount !== '') {
      where.amount = { ...(where.amount || {}), gte: parseFloat(minAmount) };
    }
    if (maxAmount !== undefined && maxAmount !== '') {
      where.amount = { ...(where.amount || {}), lte: parseFloat(maxAmount) };
    }

    // Sorting
    const validSortFields = ['voucherNumber', 'amount', 'expenseDate', 'createdAt', 'status', 'department'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const [vouchers, totalCount] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy: { [sortField]: direction },
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true, employeeId: true, department: true }
          },
          approvedBy: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.voucher.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: vouchers,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(totalCount / take)
      }
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vouchers.',
      error: error.message
    });
  }
};

/**
 * 3. Get Single Voucher Details by ID
 */
const getVoucherById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid voucher ID.' });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, employeeId: true, department: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Role security: Employees cannot view vouchers created by others
    if (req.user.role === 'EMPLOYEE' && voucher.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view vouchers created by yourself.'
      });
    }

    res.status(200).json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Get voucher by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve voucher details.'
    });
  }
};

/**
 * 4. Update Voucher (EMPLOYEE only)
 * Business Rule: Employees may edit vouchers only while in DRAFT status.
 * Once submitted, vouchers become read-only.
 */
const updateDraftVoucher = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid voucher ID.' });
    }

    const existingVoucher = await prisma.voucher.findUnique({ where: { id } });
    if (!existingVoucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Check ownership
    if (existingVoucher.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own vouchers.'
      });
    }

    // Business Rule Check: Only Draft can be edited
    if (existingVoucher.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Voucher cannot be edited because it is in '${existingVoucher.status}' status. Only DRAFT vouchers can be modified.`
      });
    }

    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      signatureData
    } = req.body;

    const updateData = {};

    if (department !== undefined) {
      if (!department.trim()) return res.status(400).json({ success: false, message: 'Department cannot be empty.' });
      updateData.department = department.trim();
    }
    if (expenseTitle !== undefined) {
      if (!expenseTitle.trim()) return res.status(400).json({ success: false, message: 'Expense title cannot be empty.' });
      updateData.expenseTitle = expenseTitle.trim();
    }
    if (expenseDate !== undefined) {
      updateData.expenseDate = new Date(expenseDate);
    }
    if (expenseCategory !== undefined) {
      updateData.expenseCategory = expenseCategory.trim();
    }
    if (expenseDescription !== undefined) {
      updateData.expenseDescription = expenseDescription ? expenseDescription.trim() : null;
    }
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
      }
      updateData.amount = parsedAmount;
    }

    // Handle Signature update if provided
    if (req.file) {
      updateData.employeeSignature = `/uploads/signatures/${req.file.filename}`;
    } else if (signatureData) {
      updateData.employeeSignature = saveBase64Image(signatureData, 'emp-sig');
    }

    const updated = await prisma.voucher.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Draft voucher updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update voucher.',
      error: error.message
    });
  }
};

/**
 * 5. Submit Draft Voucher for Approval (EMPLOYEE only)
 * Business Rule:
 * - Must be currently in DRAFT status
 * - Employee signature is mandatory before submission
 * - Once submitted, status becomes SUBMITTED
 */
const submitVoucher = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid voucher ID.' });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own vouchers.'
      });
    }

    if (voucher.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Only DRAFT vouchers can be submitted. This voucher is already '${voucher.status}'.`
      });
    }

    // Signature resolution: request file, base64 payload, existing signature on voucher, or user's default signature
    let signatureUrl = voucher.employeeSignature;
    if (req.file) {
      signatureUrl = `/uploads/signatures/${req.file.filename}`;
    } else if (req.body.signatureData) {
      signatureUrl = saveBase64Image(req.body.signatureData, 'emp-sig');
    } else if (!signatureUrl && req.user.signatureUrl) {
      signatureUrl = req.user.signatureUrl;
    }

    if (!signatureUrl) {
      return res.status(400).json({
        success: false,
        message: 'Employee signature is mandatory before submission. Please upload or draw your signature.'
      });
    }

    const submitted = await prisma.voucher.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        employeeSignature: signatureUrl
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Voucher submitted successfully for Director approval.',
      data: submitted
    });
  } catch (error) {
    console.error('Submit voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit voucher.',
      error: error.message
    });
  }
};

/**
 * 6. Delete Voucher (EMPLOYEE only)
 * Business Rule: Employees may delete vouchers only while they are in Draft status.
 */
const deleteDraftVoucher = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid voucher ID.' });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own vouchers.'
      });
    }

    if (voucher.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete voucher in '${voucher.status}' status. Only DRAFT vouchers can be deleted.`
      });
    }

    await prisma.voucher.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Draft voucher deleted successfully.'
    });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete voucher.'
    });
  }
};

/**
 * 7. Approve Voucher (DIRECTOR only)
 * Business Rules:
 * - Only Director can approve
 * - Voucher must be in SUBMITTED status
 * - Director signature is mandatory before approval
 * - Director cannot modify employee data
 * - Approved vouchers become read-only
 */
const approveVoucher = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid voucher ID.' });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve voucher in '${voucher.status}' status. Only SUBMITTED vouchers can be approved.`
      });
    }

    // Resolve Director Signature
    let directorSignature = null;
    if (req.file) {
      directorSignature = `/uploads/signatures/${req.file.filename}`;
    } else if (req.body.signatureData) {
      directorSignature = saveBase64Image(req.body.signatureData, 'dir-sig');
    } else if (req.user.signatureUrl) {
      directorSignature = req.user.signatureUrl;
    }

    if (!directorSignature) {
      return res.status(400).json({
        success: false,
        message: 'Director signature is mandatory before approving a voucher.'
      });
    }

    const approved = await prisma.voucher.update({
      where: { id },
      data: {
        status: 'APPROVED',
        directorSignature,
        approvalDate: new Date(),
        approvedById: req.user.id,
        rejectionReason: null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: `Voucher ${approved.voucherNumber} approved successfully.`,
      data: approved
    });
  } catch (error) {
    console.error('Approve voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve voucher.',
      error: error.message
    });
  }
};

/**
 * 8. Reject Voucher (DIRECTOR only)
 * Business Rules:
 * - Only Director can reject
 * - Voucher must be in SUBMITTED status
 * - Rejection Reason is mandatory if rejected
 */
const rejectVoucher = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid voucher ID.' });
    }

    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting a voucher.'
      });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject voucher in '${voucher.status}' status. Only SUBMITTED vouchers can be rejected.`
      });
    }

    const rejected = await prisma.voucher.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        approvalDate: new Date(),
        approvedById: req.user.id
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: `Voucher ${rejected.voucherNumber} rejected.`,
      data: rejected
    });
  } catch (error) {
    console.error('Reject voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject voucher.',
      error: error.message
    });
  }
};

/**
 * 9. Dashboards (Role-specific statistics)
 * Requirement 8:
 * - Employee Dashboard
 * - Director Dashboard
 * - Accounts Dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'EMPLOYEE') {
      // Employee Dashboard:
      // Total Vouchers, Draft Vouchers, Pending Approval, Approved Vouchers, Rejected Vouchers, Total Amount Claimed
      const [total, draft, pending, approved, rejected, vouchers] = await Promise.all([
        prisma.voucher.count({ where: { userId } }),
        prisma.voucher.count({ where: { userId, status: 'DRAFT' } }),
        prisma.voucher.count({ where: { userId, status: 'SUBMITTED' } }),
        prisma.voucher.count({ where: { userId, status: 'APPROVED' } }),
        prisma.voucher.count({ where: { userId, status: 'REJECTED' } }),
        prisma.voucher.findMany({
          where: { userId },
          select: { amount: true, status: true }
        })
      ]);

      // Total claimed amount is the sum of approved vouchers (or all non-draft)
      const totalAmountClaimed = vouchers
        .filter(v => v.status === 'APPROVED')
        .reduce((sum, v) => sum + v.amount, 0);

      const recentVouchers = await prisma.voucher.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return res.status(200).json({
        success: true,
        data: {
          role: 'EMPLOYEE',
          totalVouchers: total,
          draftVouchers: draft,
          pendingApproval: pending,
          approvedVouchers: approved,
          rejectedVouchers: rejected,
          totalAmountClaimed: parseFloat(totalAmountClaimed.toFixed(2)),
          recentVouchers
        }
      });
    }

    if (userRole === 'DIRECTOR') {
      // Director Dashboard:
      // Pending Approval Count, Approved Today, Rejected Today, Total Pending Amount, Recent Voucher Activity
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [pendingCount, approvedToday, rejectedToday, pendingVouchers, totalVouchers, recentActivity] = await Promise.all([
        prisma.voucher.count({ where: { status: 'SUBMITTED' } }),
        prisma.voucher.count({
          where: {
            status: 'APPROVED',
            approvalDate: { gte: startOfToday, lte: endOfToday }
          }
        }),
        prisma.voucher.count({
          where: {
            status: 'REJECTED',
            approvalDate: { gte: startOfToday, lte: endOfToday }
          }
        }),
        prisma.voucher.findMany({
          where: { status: 'SUBMITTED' },
          select: { amount: true }
        }),
        prisma.voucher.count(),
        prisma.voucher.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            user: { select: { id: true, name: true, department: true } }
          }
        })
      ]);

      const totalPendingAmount = pendingVouchers.reduce((sum, v) => sum + v.amount, 0);

      return res.status(200).json({
        success: true,
        data: {
          role: 'DIRECTOR',
          pendingApprovalCount: pendingCount,
          approvedToday,
          rejectedToday,
          totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2)),
          totalVouchers,
          recentVoucherActivity: recentActivity
        }
      });
    }

    if (userRole === 'ACCOUNTS') {
      // Accounts Dashboard:
      // Total Vouchers, Pending Approval, Approved Vouchers, Rejected Vouchers, Total Approved Expense Amount, Recent Approved Vouchers
      const [total, pending, approved, rejected, approvedVouchersList, recentApproved] = await Promise.all([
        prisma.voucher.count(),
        prisma.voucher.count({ where: { status: 'SUBMITTED' } }),
        prisma.voucher.count({ where: { status: 'APPROVED' } }),
        prisma.voucher.count({ where: { status: 'REJECTED' } }),
        prisma.voucher.findMany({
          where: { status: 'APPROVED' },
          select: { amount: true }
        }),
        prisma.voucher.findMany({
          where: { status: 'APPROVED' },
          orderBy: { approvalDate: 'desc' },
          take: 5,
          include: {
            user: { select: { id: true, name: true, department: true, employeeId: true } }
          }
        })
      ]);

      const totalApprovedExpenseAmount = approvedVouchersList.reduce((sum, v) => sum + v.amount, 0);

      return res.status(200).json({
        success: true,
        data: {
          role: 'ACCOUNTS',
          totalVouchers: total,
          pendingApproval: pending,
          approvedVouchers: approved,
          rejectedVouchers: rejected,
          totalApprovedExpenseAmount: parseFloat(totalApprovedExpenseAmount.toFixed(2)),
          recentApprovedVouchers: recentApproved
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role for dashboard.' });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
      error: error.message
    });
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateDraftVoucher,
  submitVoucher,
  deleteDraftVoucher,
  approveVoucher,
  rejectVoucher,
  getDashboardStats
};
