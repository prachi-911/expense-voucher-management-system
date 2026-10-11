-- ========================================================
-- Expense Voucher Management System - Database Schema (SQL)
-- Compatible with MySQL and PostgreSQL
-- ========================================================

-- Drop tables if exist (for fresh setup)
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS users;

-- --------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS') NOT NULL DEFAULT 'EMPLOYEE',
    employeeId VARCHAR(100),
    department VARCHAR(150),
    signatureUrl VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 2. Vouchers Table
-- --------------------------------------------------------
CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voucherNumber VARCHAR(50) NOT NULL UNIQUE,
    voucherDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expenseDate TIMESTAMP NOT NULL,
    department VARCHAR(150) NOT NULL,
    expenseTitle VARCHAR(255) NOT NULL,
    expenseCategory VARCHAR(100) NOT NULL,
    expenseDescription TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    
    -- Employee Details
    employeeName VARCHAR(255) NOT NULL,
    employeeId VARCHAR(100),
    employeeSignature VARCHAR(500),
    userId INT NOT NULL,
    
    -- Approval Workflow
    status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    directorSignature VARCHAR(500),
    approvalDate TIMESTAMP NULL,
    approvedById INT NULL,
    rejectionReason TEXT NULL,
    
    -- Audit Timestamps
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_voucher_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_director FOREIGN KEY (approvedById) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- 3. Indexes for High Performance Queries, Filters & Reports
-- --------------------------------------------------------
CREATE INDEX idx_vouchers_user ON vouchers(userId);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_expense_date ON vouchers(expenseDate);
CREATE INDEX idx_vouchers_department ON vouchers(department);
CREATE INDEX idx_vouchers_category ON vouchers(expenseCategory);
CREATE INDEX idx_vouchers_voucher_number ON vouchers(voucherNumber);
