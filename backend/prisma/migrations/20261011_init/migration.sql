-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "employeeId" TEXT,
    "department" TEXT,
    "signatureUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voucherNumber" TEXT NOT NULL,
    "voucherDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expenseDate" DATETIME NOT NULL,
    "department" TEXT NOT NULL,
    "expenseTitle" TEXT NOT NULL,
    "expenseCategory" TEXT NOT NULL,
    "expenseDescription" TEXT,
    "amount" REAL NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeSignature" TEXT,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "directorSignature" TEXT,
    "approvalDate" DATETIME,
    "approvedById" INTEGER,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Voucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voucher_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");
