# PIMS - Project Inventory Management System (Enterprise Edition)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-teal.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.3-cyan.svg)](https://capacitorjs.com/)

A real-time, multi-location inventory, procurement, and financial resource tracking system designed for construction, engineering, and multi-site enterprise operations.

---

## 🚀 Key Features

### 1. Multi-Project Inventory & Material Tracking
- Real-time tracking of materials, items, and site allocations.
- Automated low-stock alerts with real-time in-app and SMS notifications.
- Inter-project and warehouse transfer requests with dual approval workflows.
- Material consumption and usage logging with cost tracking.

### 2. End-to-End Procurement Workflow
- Purchase Requisition (PR) lifecycle from submission to verification and approval.
- Automated Purchase Order (PO) creation directly from approved requisitions.
- Supplier and vendor relationship management with performance evaluation metrics.
- Professional print preview and export formats (PDF / Excel / CSV).

### 3. Financial & Compliance Management
- **Budget Tracking**: Project-by-project budget vs. actual expenditure analytics.
- **Bill Verification**: Multi-stage bill inspection and manager sign-off.
- **Bank & Cash Book**: Bank account reconciliations and ledger audit trails.
- **Petty Cash**: Site-level petty cash vouchers and expense claims.
- **VAT & Tax Management**: AIT and VAT compliance records.

### 4. Comprehensive Analytics & Reporting
- 16+ dedicated analytical reports including ROI analysis, stock movement history, inventory valuation, and monthly expenditure.
- Custom report builder with dynamic column selection, filtering, and export.
- Rich data visualizations using Recharts.

### 5. Enterprise Security & Architecture
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin, Management, Manager, Store Keeper, Finance Executive, and Viewer.
- **Row-Level Security (RLS)**: Enforced directly at the database layer in Supabase Postgres.
- **Performance Optimized**: Route-based code-splitting with `React.lazy()` and intelligent Rollup vendor chunking (initial bundle `< 70 KB`).
- **Resilient Error Handling**: True React Class Error Boundary for graceful render fallback.
- **Cross-Platform**: Web, PWA, and native Android support via Capacitor.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Radix UI primitives, Lucide Icons, Sonner.
- **State & Data**: React Hooks, Context API, Supabase Realtime Channels.
- **Build Tool**: Vite 7 with Rollup code-splitting and Terser minification.
- **Backend & Database**: Supabase (PostgreSQL with RLS, Auth, Edge Functions, Storage).
- **Mobile**: Capacitor 8.3 Android runtime.

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 1. Clone & Install
```bash
git clone https://github.com/iaaasif/pims.git
cd pims
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_NODE_ENV=development
VITE_DEBUG=true
```

### 3. Database Setup (Supabase)
Run the migration scripts located in `supabase/migrations/` sequentially in your Supabase SQL Editor or via Supabase CLI:
```bash
npx supabase db push
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Mobile Build (Android)

Build the web application and sync with Android Capacitor:
```bash
npm run build
npx cap sync android
npx cap open android
```
In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🧪 Quality & Verification Scripts

```bash
# Type check and production build
npm run build

# Code style and linting (0 errors)
npm run lint

# Security vulnerability audit
npm audit
```

---

## 📄 License
Private & Confidential — All rights reserved.
