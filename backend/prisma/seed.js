const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/signatures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Minimal valid transparent 120x50 PNG signature data (handwritten style representation)
const sampleEmpSigBase64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAIIAAAAyCAYAAACiWj2rAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAA' +
  'AilJREFUeJzt2bFtwzAQRdFvAi1dJEW4iHtpE7qIe3ARt6Am3Xo7QOAgQAID3gN4w0vwnwfeG8mSFElhDIB57/3T5/P55Zzz' +
  '5+UfFjXw7qfvfXz6u/9U9L5/9p53f+/78/j0980r73u+j/qgqO0h4nQ9iQ9qD3/yQ41P64eavfN/vPff/v3fK+f8e/j/gVrq' +
  'fX/u772/9/d/p77f+18/8/9f911ff9wG/c2xX+X9g1rrv5f615/7/h+f+6v/x/qgX7k/9u+gX7n/u/f+X/9D5H9d7/e/98eY' +
  'GgAAAABJRU5ErkJggg==';

const sampleDirSigBase64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAIIAAAAyCAYAAACiWj2rAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAA' +
  'AhdJREFUeJzt2bFtwzAQRdFvAi1dJEW4iHtpE7qIe3ARt6Am3Xo7QOAgQAID3gN4w0vwnwfeG8mSFElhDIB57/3T5/P55Zzz' +
  '5+UfFjXw7qfvfXz6u/9U9L5/9p53f+/78/j0980r73u+j/qgqO0h4nQ9iQ9qD3/yQ41P64eavfN/vPff/v3fK+f8e/j/gVrq' +
  'fX/u772/9/d/p77f+18/8/9f911ff9wG/c2xX+X9g1rrv5f615/7/h+f+6v/x/qgX7k/9u+gX7n/u/f+X/9D5H9d7/e/98eY' +
  'GgAAAABJRU5ErkJggg==';

const empSigFile = path.join(uploadDir, 'sample-emp-sig.png');
const dirSigFile = path.join(uploadDir, 'sample-dir-sig.png');

fs.writeFileSync(empSigFile, Buffer.from(sampleEmpSigBase64, 'base64'));
fs.writeFileSync(dirSigFile, Buffer.from(sampleDirSigBase64, 'base64'));

const empSigUrl = '/uploads/signatures/sample-emp-sig.png';
const dirSigUrl = '/uploads/signatures/sample-dir-sig.png';

async function main() {
  console.log('Seeding database with demo users and realistic vouchers...');

  // Clean existing data
  await prisma.voucher.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users
  // 1. Seed Users (Supports @prachay.com, @prachaysecurities.com, and legacy @abc.com)
  const employee1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'employee@prachay.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      employeeId: 'EMP-1001',
      department: 'Engineering',
      signatureUrl: empSigUrl
    }
  });

  // Alias employee for easy login
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'employee@abc.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      employeeId: 'EMP-1001',
      department: 'Engineering',
      signatureUrl: empSigUrl
    }
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@prachay.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      employeeId: 'EMP-1002',
      department: 'Marketing',
      signatureUrl: empSigUrl
    }
  });

  const director = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'director@prachay.com',
      password: passwordHash,
      role: 'DIRECTOR',
      employeeId: 'DIR-2001',
      department: 'Executive Leadership',
      signatureUrl: dirSigUrl
    }
  });

  // Alias director
  await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'director@abc.com',
      password: passwordHash,
      role: 'DIRECTOR',
      employeeId: 'DIR-2001',
      department: 'Executive Leadership',
      signatureUrl: dirSigUrl
    }
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Michael Scott',
      email: 'accounts@prachay.com',
      password: passwordHash,
      role: 'ACCOUNTS',
      employeeId: 'ACC-3001',
      department: 'Finance & Accounts',
      signatureUrl: null
    }
  });

  // Alias accounts
  await prisma.user.create({
    data: {
      name: 'Michael Scott',
      email: 'accounts@abc.com',
      password: passwordHash,
      role: 'ACCOUNTS',
      employeeId: 'ACC-3001',
      department: 'Finance & Accounts',
      signatureUrl: null
    }
  });

  console.log('Created ABC Company Users:');
  console.log(' - Employee: employee@abc.com');
  console.log(' - Director: director@abc.com');
  console.log(' - Accounts: accounts@abc.com');

  // 2. Seed Vouchers
  // Voucher 1: DRAFT (John Doe)
  await prisma.voucher.create({
    data: {
      voucherNumber: 'EV-202610-0001',
      voucherDate: new Date('2026-10-08T10:00:00Z'),
      expenseDate: new Date('2026-10-07T00:00:00Z'),
      department: 'Engineering',
      expenseTitle: 'AWS Cloud Architecture Training Course',
      expenseCategory: 'Training & Development',
      expenseDescription: 'Enrolled in advanced cloud scalability certification for Q4 architecture migration.',
      amount: 14500.00,
      employeeName: employee1.name,
      employeeId: employee1.employeeId,
      employeeSignature: empSigUrl,
      userId: employee1.id,
      status: 'DRAFT'
    }
  });

  // Voucher 2: SUBMITTED / Pending Approval (John Doe)
  await prisma.voucher.create({
    data: {
      voucherNumber: 'EV-202610-0002',
      voucherDate: new Date('2026-10-09T11:30:00Z'),
      expenseDate: new Date('2026-10-08T00:00:00Z'),
      department: 'Engineering',
      expenseTitle: 'Flight Tickets for Tech Summit Bangalore',
      expenseCategory: 'Travel',
      expenseDescription: 'Round-trip flight booking to represent ABC Company at TechSparks Bangalore summit.',
      amount: 18250.50,
      employeeName: employee1.name,
      employeeId: employee1.employeeId,
      employeeSignature: empSigUrl,
      userId: employee1.id,
      status: 'SUBMITTED'
    }
  });

  // Voucher 3: SUBMITTED / Pending Approval (Jane Smith)
  await prisma.voucher.create({
    data: {
      voucherNumber: 'EV-202610-0003',
      voucherDate: new Date('2026-10-10T14:15:00Z'),
      expenseDate: new Date('2026-10-09T00:00:00Z'),
      department: 'Marketing',
      expenseTitle: 'Quarterly Client Appreciation Dinner',
      expenseCategory: 'Client Entertainment',
      expenseDescription: 'Client dinner with prospective enterprise enterprise accounts partners.',
      amount: 8740.00,
      employeeName: employee2.name,
      employeeId: employee2.employeeId,
      employeeSignature: empSigUrl,
      userId: employee2.id,
      status: 'SUBMITTED'
    }
  });

  // Voucher 4: APPROVED (John Doe)
  await prisma.voucher.create({
    data: {
      voucherNumber: 'EV-202610-0004',
      voucherDate: new Date('2026-10-05T09:00:00Z'),
      expenseDate: new Date('2026-10-04T00:00:00Z'),
      department: 'Engineering',
      expenseTitle: 'External 4K Monitor for Production Workstation',
      expenseCategory: 'Office Supplies',
      expenseDescription: 'Hardware equipment required for design and testing multi-display layout.',
      amount: 22999.00,
      employeeName: employee1.name,
      employeeId: employee1.employeeId,
      employeeSignature: empSigUrl,
      userId: employee1.id,
      status: 'APPROVED',
      directorSignature: dirSigUrl,
      approvalDate: new Date('2026-10-06T15:00:00Z'),
      approvedById: director.id
    }
  });

  // Voucher 5: REJECTED (Jane Smith)
  await prisma.voucher.create({
    data: {
      voucherNumber: 'EV-202610-0005',
      voucherDate: new Date('2026-10-04T12:00:00Z'),
      expenseDate: new Date('2026-10-03T00:00:00Z'),
      department: 'Marketing',
      expenseTitle: 'Weekend Taxi Commute Without Prior Approval',
      expenseCategory: 'Travel',
      expenseDescription: 'Personal taxi receipts for weekend travel.',
      amount: 3400.00,
      employeeName: employee2.name,
      employeeId: employee2.employeeId,
      employeeSignature: empSigUrl,
      userId: employee2.id,
      status: 'REJECTED',
      approvalDate: new Date('2026-10-05T10:30:00Z'),
      approvedById: director.id,
      rejectionReason: 'Commute expenses on non-working weekends require prior written managerial authorization.'
    }
  });

  // Voucher 6: APPROVED (Jane Smith)
  await prisma.voucher.create({
    data: {
      voucherNumber: 'EV-202610-0006',
      voucherDate: new Date('2026-10-02T16:00:00Z'),
      expenseDate: new Date('2026-10-01T00:00:00Z'),
      department: 'Marketing',
      expenseTitle: 'Q4 Annual SaaS Creative Cloud Licenses',
      expenseCategory: 'Software & Subscriptions',
      expenseDescription: 'Annual subscription renewal for design team tools.',
      amount: 35600.00,
      employeeName: employee2.name,
      employeeId: employee2.employeeId,
      employeeSignature: empSigUrl,
      userId: employee2.id,
      status: 'APPROVED',
      directorSignature: dirSigUrl,
      approvalDate: new Date('2026-10-03T11:00:00Z'),
      approvedById: director.id
    }
  });

  console.log('Seeded 6 sample vouchers across DRAFT, SUBMITTED, APPROVED, and REJECTED statuses.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
