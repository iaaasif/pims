<div align="center">

# 🏗️ PIMS — Project Inventory Management System
### *Enterprise Resource, Multi-Location Inventory & Procurement Platform*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_Notifications-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.3_Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br/>

**PIMS (Enterprise Edition)** is an industrial-grade, cloud-native inventory, procurement, and financial tracking solution engineered specifically for construction enterprises, multi-site infrastructure projects, engineering firms, and distributed supply chains.

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Mobile Setup](#-mobile-build-android) • [Reports & Analytics](#-analytics--business-intelligence)

---

</div>

## 🌟 Overview & Highlights

- **⚡ Serverless Architecture**: Powered by **Neon Serverless PostgreSQL** with instant compute autoscaling and connection pooling.
- **🔔 Live Notifications**: Real-time notifications and system-wide broadcast alerts powered by **Firebase**.
- **📱 True Cross-Platform**: Responsive Web application + Native Android APK packaged with **Capacitor 8.3**.
- **🌓 Dynamic Adaptive UI**: Smart Dark/Light theme switching synchronized with native Android Status Bar and Navigation Bar.
- **🔒 Enterprise RBAC**: Role-based access control with granular permission tiers (*Admin*, *Management*, *Manager*, *Storekeeper*, *Accountant*).
- **📊 Real-Time Financial Reconciliations**: Project budget vs. actual expenditure, petty cash journals, VAT/Tax management, and bill verification.

---

## 🚀 Key Features

### 1. 📦 Multi-Location Inventory & Stock Management
- **Site-to-Site Visibility**: Real-time tracking of materials, items, minimum stock thresholds, and location allocations.
- **Inter-Warehouse Transfers**: End-to-end stock transfer lifecycle with origin checkout, dispatch tracking, and destination receipt verification.
- **Material Consumption Logs**: Granular logging of material usage per project unit with cost attribution.
- **Automated Low-Stock Engine**: Automatic detection and instant alerts when items fall below safe thresholds.

### 2. 📑 Procurement & Vendor Management
- **Purchase Requisitions (PR)**: Multi-item requisition creation, department review, and executive sign-off.
- **Purchase Orders (PO)**: Automated generation of Purchase Orders directly from approved requisitions with vendor assignment.
- **Vendor Scorecards**: Performance evaluation tracking delivery punctuality, quality ratings, and credit terms.
- **Document Generation**: Print-ready, branded Purchase Orders and Requisition vouchers (PDF / CSV / Print).

### 3. 💳 Financial Tracking & Compliance
- **Budget Tracking**: Live expenditure vs. allocated project budget monitoring with real-time variance calculation.
- **Bill Verification**: Multi-stage bill inspection, invoice matching, and manager approvals.
- **Bank & Cash Book**: Multi-account ledger reconciliation and transaction audit trails.
- **Petty Cash Management**: Site-level petty cash vouchers, expense claims, and disbursement logs.
- **VAT & Tax Management**: Comprehensive records for AIT (Advance Income Tax) and VAT compliance.

### 4. 📈 16+ Analytics & Business Intelligence Reports
- **Stock Movement History**: Chronological audit trail of all receipts, issuances, and transfers.
- **Inventory Valuation**: Current stock valuation based on real-time unit pricing.
- **Spend & Cost Analysis**: Vendor spend trends and cost-per-project cost attribution.
- **ROI & Timeline Analytics**: Return on investment calculations and project progress milestones.
- **Custom Report Builder**: Dynamic drag-and-drop column selector with multi-format export (Excel / CSV / PDF).

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client[Web Browser / Capacitor Android App]
    
    subgraph Frontend Layer
        UI[React 19 + TypeScript SPA]
        Router[React Router v7]
        ThemeEngine[Adaptive Theme Engine - Status/Nav Bars]
    end
    
    subgraph Data & Sync Layer
        NeonDriver[Neon Serverless Client via HTTP]
        FirebaseBus[Firebase Realtime Notification Bus]
    end
    
    subgraph Cloud Infrastructure
        NeonDB[(Neon PostgreSQL 16 - AWS ap-southeast-1)]
        FirebaseCloud[(Firebase Cloud Realtime DB)]
    end

    Client --> Frontend Layer
    UI --> NeonDriver
    UI --> FirebaseBus
    NeonDriver -->|Serverless HTTP Queries| NeonDB
    FirebaseBus -->|Real-Time Event Pub/Sub| FirebaseCloud
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.2** | Modern component architecture with concurrency features |
| **Language** | **TypeScript 5.9** | Strict static type checking with zero compiler warnings |
| **Build Tool** | **Vite 7.3** | Lightning-fast HMR and optimized production bundle chunking |
| **Styling** | **Tailwind CSS 3.4** | Utility-first responsive design with HSL design tokens |
| **UI Components** | **Radix UI Primitives** | Accessible, headless dialogs, popovers, dropdowns, and tooltips |
| **Database** | **Neon Serverless Postgres** | PostgreSQL 16 on AWS (`ap-southeast-1`) with connection pooling |
| **Realtime / Live Alerts** | **Firebase** | Real-time database event broadcasting and notification listeners |
| **Mobile Runtime** | **Capacitor 8.3** | Native Android bridge with status bar & navigation bar customization |
| **Visualizations** | **Recharts 2.15** | Interactive charts for financial and stock analytical data |
| **Icons & Notifications** | **Lucide React + Sonner** | Crisp modern SVG icons and toast notification engine |

---

## 🏁 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Android Studio** *(for mobile development)*: Hedgehog / Ladybug or newer

### 1. Clone the Repository
```bash
git clone https://github.com/iaaasif/pims.git
cd pims
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Set your Neon Database URL and Firebase credentials:
```env
# Neon Serverless PostgreSQL
VITE_NEON_DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-curly-unit-b3kptnnt-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Firebase Live Notifications
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_DATABASE_URL=https://YOUR_PROJECT-default-rtdb.firebaseio.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📱 Mobile Build (Android)

PIMS is fully configured with Capacitor to generate native Android APKs.

```bash
# 1. Build the production web bundle
npm run build

# 2. Sync web assets and plugins to Android project
npx cap sync android

# 3. Open project in Android Studio
npx cap open android
```

> **Build APK in Android Studio**:
> 1. Wait for Gradle sync to complete.
> 2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
> 3. Your production APK will be generated under `android/app/build/outputs/apk/release/`.

---

## 📂 Project Structure

```
pims/
├── android/                   # Native Android Capacitor workspace
│   ├── app/                   # App module, gradle configs & manifests
│   └── variables.gradle       # SDK versions (compileSdk 35, minSdk 23)
├── src/
│   ├── components/            # Reusable UI & domain-specific components
│   │   ├── admin/             # RBAC, audit logs & user management
│   │   ├── layout/            # Sidebar, mobile bottom nav & header
│   │   ├── procurement/       # Requisition and PO modal dialogs
│   │   └── ui/                # Accessible Radix UI design system
│   ├── context/               # Auth, Settings & SystemNotification contexts
│   ├── hooks/                 # Business logic hooks (projects, inventory, etc.)
│   │   ├── useStatusBar.ts    # Native theme-aware status & navigation bar
│   │   └── useInventory.ts    # Inventory management hook
│   ├── lib/                   # Integrations & utilities
│   │   ├── neon.ts            # Neon Serverless HTTP database client
│   │   ├── neonPostgresClient.ts # Fluent PostgREST-compatible SQL adapter
│   │   └── firebase.ts        # Firebase live notifications & pub/sub bus
│   ├── pages/                 # Route pages (Inventory, PO, Financial, etc.)
│   │   └── reports/           # 16+ dedicated analytical report views
│   └── App.tsx                # App entry with route code-splitting
├── capacitor.config.ts        # Capacitor mobile configuration
├── tailwind.config.js         # Design system tokens and palette
├── vite.config.ts             # Vite build & chunking configuration
└── package.json               # Dependencies & scripts
```

---

## 🧪 Quality & Verification Scripts

```bash
# Type check and build bundle
npm run build

# ESLint code style inspection
npm run lint

# Preview production build locally
npm run preview
```

---

## 🤝 Contribution & Standards

- Follow clean code practices and strict TypeScript typings.
- Maintain responsive layouts across mobile, tablet, and widescreen displays.
- Keep system bars and theme transitions synchronized across platforms.

---

<div align="center">

**Enterprise Project Inventory Management System**  
*Built with React 19, Neon Database & Firebase*  
© All rights reserved.

</div>
