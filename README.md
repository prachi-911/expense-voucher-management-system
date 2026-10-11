# Expense Voucher Management System

A production-ready, full-stack web application designed for **ABC Company** (evaluated for **Prachay Securities Private Limited**) to digitize the complete employee expense voucher lifecycle — from creation and drafting, to digital signature submission, executive Director approval/rejection, and Accounts team reimbursement processing.

---

## 📋 Table of Contents
- [Key Features & Role Matrix](#-key-features--role-matrix)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema & Migrations](#-database-schema--migrations)
- [RESTful API Documentation](#-restful-api-documentation)
- [Getting Started / Setup Instructions](#-getting-started--setup-instructions)
- [Default Demo Credentials](#-default-demo-credentials)
- [Business & Validation Rules Implemented](#-business--validation-rules-implemented)
- [Assumptions Made During Development](#-assumptions-made-during-development)

---

## 🌟 Key Features & Role Matrix

| Capability / Requirement | Employee | Director (Admin) | Accounts Team |
|---|:---:|:---:|:---:|
| **Secure JWT Login / Register** | ✅ | ✅ | ✅ |
| **Role-Specific Dashboard Analytics** | ✅ (Own Claims) | ✅ (Org Queue) | ✅ (Reimbursement Pool) |
| **Create Expense Voucher** | ✅ | ❌ | ❌ |
| **Save as Draft** | ✅ | ❌ | ❌ |
| **Edit / Delete Voucher** | ✅ (Drafts only) | ❌ | ❌ |
| **Submit Voucher for Approval** | ✅ | ❌ | ❌ |
| **Digital Signature (Upload & Canvas Draw)** | ✅ (Mandatory for submit) | ✅ (Mandatory for approve) | ❌ |
| **View Vouchers** | 🔒 Own only | 🌐 Organization-wide | 🌐 Organization-wide |
| **Approve / Reject Vouchers** | ❌ | ✅ (Only Director) | ❌ |
| **Provide Rejection Remarks** | ❌ | ✅ (Mandatory if rejected)| ❌ |
| **View Rejection Remarks** | ✅ | ✅ | ✅ |
| **Search, Filter (7 Criteria) & Sort** | ✅ | ✅ | ✅ (Bonus Feature) |
| **Print / Export Official Voucher Receipt** | ✅ | ✅ | ✅ (Bonus Feature) |

---

## 🛠 System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6 with role-based protected routes (`ProtectedRoute`)
- **Styling**: Tailwind CSS with custom corporate design system
- **Icons**: Lucide React
- **HTTP Client**: Axios with automated JWT injection & session expiration interceptors
- **Interactive Signature**: HTML5 Canvas digital pen signature pad + file upload support
- **Print Engine**: Dedicated `@media print` official company voucher receipt sheet

### Backend
- **Runtime**: Node.js (v20+ / v22+)
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT) + BCrypt (password hashing)
- **Role-Based Access Control (RBAC)**: Custom Express authorization middlewares
- **File Uploads**: Multer image handler with MIME validation (JPEG, PNG, WEBP)
- **ORM & Migrations**: Prisma ORM with SQLite (zero-config local portability, seamless MySQL / PostgreSQL compatibility)

---

## 📂 Project Directory Structure

```text
full_stack_assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma data model definition
│   │   ├── seed.js                  # Database seeder with demo accounts & realistic vouchers
│   │   └── migrations/              # Migration SQL history
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Prisma client singleton
│   │   │   └── multer.js            # Image upload & base64 signature pipeline
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, session profile
│   │   │   └── voucherController.js # Complete business rules & voucher workflow
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification & role authorization
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoint router
│   │   │   └── voucherRoutes.js     # Voucher lifecycle & stats router
│   │   ├── utils/
│   │   │   └── voucherNumber.js     # Atomic unique voucher number generator (EV-YYYYMM-XXXX)
│   │   └── server.js                # Express app entry point
│   ├── uploads/
│   │   └── signatures/              # Uploaded & drawn signature image store
│   ├── schema.sql                   # Standalone SQL schema (MySQL / PostgreSQL compatible)
│   ├── .env.example                 # Environment configuration template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js            # Axios client with interceptors
│   │   │   ├── authService.js       # Auth API client
│   │   │   └── voucherService.js    # Voucher CRUD & statistics client
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Role-adaptive header with active pills
│   │   │   ├── ProtectedRoute.jsx   # Client-side route & RBAC guard
│   │   │   ├── SignaturePad.jsx     # Dual-mode canvas draw & image upload
│   │   │   ├── StatusBadge.jsx      # Styled status pill indicators
│   │   │   ├── VoucherFilterBar.jsx # 7-criteria search, filter, and sort bar
│   │   │   └── VoucherPrintModal.jsx# Official printable receipt modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # React context managing auth state & tokens
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Sign in with 1-click demo personas
│   │   │   ├── Register.jsx         # Employee account creation
│   │   │   ├── Dashboard.jsx        # Role-customized statistics & fast queues
│   │   │   ├── VoucherList.jsx      # Advanced table with filter & search
│   │   │   ├── VoucherDetails.jsx   # Full inspection with signature stamps
│   │   │   ├── CreateVoucher.jsx    # Voucher creator (Draft vs Submit)
│   │   │   └── EditVoucher.jsx      # Draft voucher editor
│   │   ├── App.jsx                  # Route definitions
│   │   └── index.css                # Tailwind directives & print media rules
│   ├── .env.example                 # Frontend env template
│   └── package.json
│
└── README.md                        # Documentation
```

---

## 🗄 Database Schema & Migrations

The database schema is defined in Prisma (`prisma/schema.prisma`) as well as in standard ANSI SQL (`schema.sql`) for MySQL/PostgreSQL.

### 1. `User` Entity
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | Integer | Primary Key, Auto-increment |
| `name` | String | Full user name |
| `email` | String | Unique, mandatory work email |
| `password` | String | BCrypt hashed password |
| `role` | String / Enum | `EMPLOYEE`, `DIRECTOR`, `ACCOUNTS` |
| `employeeId` | String? | Employee ID code (e.g. `EMP-1001`) |
| `department` | String? | Primary Department |
| `signatureUrl` | String? | Path to pre-saved profile signature |
| `createdAt` | DateTime | Timestamp |
| `updatedAt` | DateTime | Timestamp |

### 2. `Voucher` Entity
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | Integer | Primary Key, Auto-increment |
| `voucherNumber` | String | Unique, formatted `EV-YYYYMM-XXXX` |
| `voucherDate` | DateTime | Creation / issuance date |
| `expenseDate` | DateTime | Mandatory date when expense occurred |
| `department` | String | Mandatory department |
| `expenseTitle` | String | Mandatory expense title |
| `expenseCategory` | String | Expense category (Travel, Supplies, etc.) |
| `expenseDescription` | String? | Detailed description & justification |
| `amount` | Float / Decimal | Mandatory, must be > 0.00 |
| `employeeName` | String | Name of submitting employee |
| `employeeId` | String? | Employee code |
| `employeeSignature` | String? | Signature image URL (mandatory on submit) |
| `userId` | Integer | Foreign key to `User.id` (Creator) |
| `status` | String / Enum | `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED` |
| `directorSignature` | String? | Signature image URL (mandatory on approval) |
| `approvalDate` | DateTime? | Timestamp when approved or rejected |
| `approvedById` | Integer? | Foreign key to `User.id` (Director) |
| `rejectionReason` | String? | Mandatory explanation if status is `REJECTED` |
| `createdAt` | DateTime | Audit timestamp |
| `updatedAt` | DateTime | Audit timestamp |

---

## 📡 RESTful API Documentation

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new account (accepts multipart/form-data for optional signature).
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <token>`).
- `PUT /api/auth/signature` — Update saved signature image.

### Voucher Endpoints (`/api/vouchers`)
- `GET /api/vouchers/dashboard` — Returns role-specific dashboard analytics.
- `GET /api/vouchers` — Fetch paginated vouchers with search, filtering, and sorting.
  - *Query Params*: `search`, `voucherNumber`, `employeeName`, `department`, `expenseCategory`, `status`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy`, `sortOrder`, `page`, `limit`.
- `GET /api/vouchers/:id` — Retrieve voucher details by ID (enforces employee visibility isolation).
- `POST /api/vouchers` — `[EMPLOYEE]` Create new voucher (`DRAFT` or `SUBMITTED`).
- `PUT /api/vouchers/:id` — `[EMPLOYEE]` Edit draft voucher (prohibited on submitted/approved/rejected).
- `POST /api/vouchers/:id/submit` — `[EMPLOYEE]` Submit draft voucher (requires signature).
- `DELETE /api/vouchers/:id` — `[EMPLOYEE]` Delete draft voucher.
- `POST /api/vouchers/:id/approve` — `[DIRECTOR]` Approve voucher (requires Director signature).
- `POST /api/vouchers/:id/reject` — `[DIRECTOR]` Reject voucher (requires `rejectionReason`).

---

## 🚀 Getting Started / Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; tested on v22)
- npm (v9+)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd full_stack_assignment
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Initialize database schema
npm run prisma:generate
npx prisma db push

# Seed demo users and sample vouchers
npm run prisma:seed

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔑 Default Demo Credentials

For convenience during evaluation, the Login page includes **1-Click Demo Buttons** to instantly log in as any role:

| Role | Email | Password | Pre-seeded State |
|---|---|---|---|
| **Employee (John Doe)** | `employee@abc.com` | `Password123!` | Has 1 Draft, 1 Submitted, 1 Approved voucher |
| **Employee (Jane Smith)** | `jane@abc.com` | `Password123!` | Has 1 Submitted, 1 Approved, 1 Rejected voucher |
| **Director (Admin)** | `director@abc.com` | `Password123!` | Pending approvals awaiting review |
| **Accounts Team** | `accounts@abc.com` | `Password123!` | Approved vouchers ready for reimbursement |

---

## ⚖️ Business & Validation Rules Implemented

1. **Voucher Identification**: Every voucher receives an automated, collision-free, human-readable voucher code (`EV-YYYYMM-XXXX`).
2. **Draft State Protection**: New vouchers can be saved as `DRAFT` without requiring an immediate signature, enabling progressive completion.
3. **Draft Editability**: Employees can only edit or delete a voucher when `status === 'DRAFT'`. Once submitted, the voucher becomes strictly immutable for the employee.
4. **Mandatory Fields**:
   - `department` cannot be blank.
   - `expenseTitle` cannot be blank.
   - `expenseDate` cannot be blank.
   - `amount` must be greater than zero.
5. **Signature Mandate**:
   - `employeeSignature` is strictly verified before transitioning to `SUBMITTED`.
   - `directorSignature` is strictly verified before transitioning to `APPROVED`.
6. **Rejection Reason Mandate**: A Director cannot reject a voucher without submitting explanatory rejection remarks.
7. **Role Visibility Isolation**:
   - Employees are completely restricted to their own vouchers (`userId === current_user.id`). Any attempt to access another employee's voucher returns `403 Forbidden`.
   - Directors and Accounts members have organization-wide visibility across all departments.
8. **Director Authority**: Only Directors can approve or reject vouchers.
9. **Accounts Safeguards**: Accounts team members have read-only access with print/export privileges and cannot edit, approve, or delete vouchers.

---

## 💡 Assumptions Made During Development

1. **Digital Signature Format**: The application supports both **interactive canvas drawing** (using mouse or stylus, serialized into standard PNG images) and **direct image upload** (PNG, JPG, WEBP). This gives employees and directors the highest level of convenience on desktop and tablet devices.
2. **Database Engine**: SQLite is utilized as the default development database for zero-config, single-command onboarding across different developer machines. For enterprise deployment (PostgreSQL / MySQL), an identical ANSI SQL migration file (`schema.sql`) and Prisma datasource switch are provided.
3. **Currency Localization**: Amount values are rendered in Indian Rupees (`INR ₹`) by default, consistent with Indian corporate standards, with support for standard 2-decimal point precision.
4. **Print / Export Capabilities**: A dedicated print sheet (`window.print()`) is integrated with standard invoice formatting so the Accounts team can directly print or "Save as PDF" for accounting archives.
