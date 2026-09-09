import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy-loaded Core Pages for maximum performance and fast initial bundle load
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const Inventory = lazy(() => import('@/pages/Inventory'))
const ProjectInventory = lazy(() => import('@/pages/ProjectInventory'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDashboard = lazy(() => import('@/pages/ProjectDashboard'))
const Requisitions = lazy(() => import('@/pages/Requisitions'))
const Orders = lazy(() => import('@/pages/Orders'))
const Vendors = lazy(() => import('@/pages/Vendors'))
const Locations = lazy(() => import('@/pages/Locations'))
const Transfers = lazy(() => import('@/pages/Transfers'))
const Reports = lazy(() => import('@/pages/Reports'))
const FinancialDashboard = lazy(() => import('@/pages/FinancialDashboard'))
const BudgetTracking = lazy(() => import('@/pages/BudgetTracking'))
const ExpenseAnalysis = lazy(() => import('@/pages/ExpenseAnalysis'))
const VatTaxManagement = lazy(() => import('@/pages/VatTaxManagement'))
const BillVerification = lazy(() => import('@/pages/BillVerification'))
const PettyCash = lazy(() => import('@/pages/PettyCash'))
const BankCashBook = lazy(() => import('@/pages/BankCashBook'))
const Login = lazy(() => import('@/pages/Login'))
const PasswordReset = lazy(() => import('@/pages/PasswordReset'))
const Settings = lazy(() => import('@/pages/Settings'))
const Maintenance = lazy(() => import('@/pages/Maintenance'))

// Lazy-loaded Report Pages
const CurrentStockStatus = lazy(() => import('./pages/reports/CurrentStockStatus'))
const StockMovementHistory = lazy(() => import('./pages/reports/StockMovementHistory'))
const LowStockItems = lazy(() => import('./pages/reports/LowStockItems'))
const InventoryValuation = lazy(() => import('./pages/reports/InventoryValuation'))
const PurchaseOrderSummary = lazy(() => import('./pages/reports/PurchaseOrderSummary'))
const RequisitionStatus = lazy(() => import('./pages/reports/RequisitionStatus'))
const VendorPerformance = lazy(() => import('./pages/reports/VendorPerformance'))
const SpendAnalysis = lazy(() => import('./pages/reports/SpendAnalysis'))
const ProjectMaterialUsage = lazy(() => import('./pages/reports/ProjectMaterialUsage'))
const BudgetVsActual = lazy(() => import('./pages/reports/BudgetVsActual'))
const ProjectTimeline = lazy(() => import('./pages/reports/ProjectTimeline'))
const ResourceAllocation = lazy(() => import('./pages/reports/ResourceAllocation'))
const MonthlyExpenditure = lazy(() => import('./pages/reports/MonthlyExpenditure'))
const CostPerProject = lazy(() => import('./pages/reports/CostPerProject'))
const BudgetVariance = lazy(() => import('./pages/reports/BudgetVariance'))
const ROIAnalysis = lazy(() => import('./pages/reports/ROIAnalysis'))
const CustomReportBuilder = lazy(() => import('./pages/reports/CustomReportBuilder'))

import Layout from './components/layout/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { NotificationProvider } from '@/context/SystemNotificationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useIdleTimeout } from './hooks/useIdleTimeout'
import { FaviconSync } from './components/layout/FaviconSync'
import { useStatusBar } from './hooks/useStatusBar'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner text="Loading page..." />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function FinanceRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }
  
  if (profile?.role !== 'admin' && profile?.role !== 'finance_executive') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRouter() {
  const { user, loading, isAdmin } = useAuth()
  const { autoLogout, maintenanceMode } = useSettings()
  
  // Initialize status bar based on theme
  useStatusBar()

  // Initialize idle timeout
  useIdleTimeout(autoLogout, !!user)

  if (loading) return null

  // Maintenance mode redirect for non-admins
  if (maintenanceMode && !isAdmin && user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<Maintenance />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <>
      <FaviconSync />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:projectId" element={<ProjectInventory />} />
            <Route path="/procurement/requisitions" element={<Requisitions />} />
            <Route path="/procurement/orders" element={<Orders />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDashboard />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Financial Routes */}
            <Route path="/financial/dashboard" element={<FinanceRoute><FinancialDashboard /></FinanceRoute>} />
            <Route path="/financial/budgets" element={<FinanceRoute><BudgetTracking /></FinanceRoute>} />
            <Route path="/financial/expenses" element={<FinanceRoute><ExpenseAnalysis /></FinanceRoute>} />
            <Route path="/financial/vat-tax" element={<FinanceRoute><VatTaxManagement /></FinanceRoute>} />
            <Route path="/financial/bills" element={<FinanceRoute><BillVerification /></FinanceRoute>} />
            <Route path="/financial/petty-cash" element={<FinanceRoute><PettyCash /></FinanceRoute>} />
            <Route path="/financial/bank-cash" element={<FinanceRoute><BankCashBook /></FinanceRoute>} />

            {/* Report Routes */}
            <Route path="/reports/current-stock-status" element={<CurrentStockStatus />} />
            <Route path="/reports/stock-movement-history" element={<StockMovementHistory />} />
            <Route path="/reports/low-stock-items" element={<LowStockItems />} />
            <Route path="/reports/inventory-valuation" element={<InventoryValuation />} />
            <Route path="/reports/purchase-order-summary" element={<PurchaseOrderSummary />} />
            <Route path="/reports/requisition-status" element={<RequisitionStatus />} />
            <Route path="/reports/vendor-performance" element={<VendorPerformance />} />
            <Route path="/reports/spend-analysis" element={<SpendAnalysis />} />
            <Route path="/reports/project-material-usage" element={<ProjectMaterialUsage />} />
            <Route path="/reports/budget-vs-actual" element={<BudgetVsActual />} />
            <Route path="/reports/project-timeline" element={<ProjectTimeline />} />
            <Route path="/reports/resource-allocation" element={<ResourceAllocation />} />
            <Route path="/reports/monthly-expenditure" element={<MonthlyExpenditure />} />
            <Route path="/reports/cost-per-project" element={<CostPerProject />} />
            <Route path="/reports/budget-variance" element={<BudgetVariance />} />
            <Route path="/reports/roi-analysis" element={<ROIAnalysis />} />
            <Route path="/reports/custom-builder" element={<CustomReportBuilder />} />

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <SettingsProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Router>
                <AppRouter />
                <Toaster />
              </Router>
            </ErrorBoundary>
          </NotificationProvider>
        </SettingsProvider>
      </AuthProvider>
    </div>
  )
}

export default App
