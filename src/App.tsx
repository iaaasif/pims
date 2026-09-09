import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import Dashboard from '@/pages/Dashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import Inventory from '@/pages/Inventory'
import ProjectInventory from '@/pages/ProjectInventory'
import Projects from '@/pages/Projects'
import ProjectDashboard from '@/pages/ProjectDashboard'
import Requisitions from '@/pages/Requisitions'
import Orders from '@/pages/Orders'
import Vendors from '@/pages/Vendors'
import Locations from '@/pages/Locations'
import Transfers from '@/pages/Transfers'
import Reports from '@/pages/Reports'
import FinancialDashboard from '@/pages/FinancialDashboard'
import BudgetTracking from '@/pages/BudgetTracking'
import ExpenseAnalysis from '@/pages/ExpenseAnalysis'
import VatTaxManagement from '@/pages/VatTaxManagement'
import BillVerification from '@/pages/BillVerification'
import PettyCash from '@/pages/PettyCash'
import BankCashBook from '@/pages/BankCashBook'
import Login from '@/pages/Login'

import PasswordReset from '@/pages/PasswordReset'
import Settings from '@/pages/Settings'
import Maintenance from '@/pages/Maintenance'

import CurrentStockStatus from './pages/reports/CurrentStockStatus'
import StockMovementHistory from './pages/reports/StockMovementHistory'
import LowStockItems from './pages/reports/LowStockItems'
import InventoryValuation from './pages/reports/InventoryValuation'
import PurchaseOrderSummary from './pages/reports/PurchaseOrderSummary'
import RequisitionStatus from './pages/reports/RequisitionStatus'
import VendorPerformance from './pages/reports/VendorPerformance'
import SpendAnalysis from './pages/reports/SpendAnalysis'
import ProjectMaterialUsage from './pages/reports/ProjectMaterialUsage'
import BudgetVsActual from './pages/reports/BudgetVsActual'
import ProjectTimeline from './pages/reports/ProjectTimeline'
import ResourceAllocation from './pages/reports/ResourceAllocation'
import MonthlyExpenditure from './pages/reports/MonthlyExpenditure'
import CostPerProject from './pages/reports/CostPerProject'
import BudgetVariance from './pages/reports/BudgetVariance'
import ROIAnalysis from './pages/reports/ROIAnalysis'
import CustomReportBuilder from './pages/reports/CustomReportBuilder'

import Layout from './components/layout/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { NotificationProvider } from '@/context/SystemNotificationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useIdleTimeout } from './hooks/useIdleTimeout'

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
  const { isAdmin, loading, profile } = useAuth()

  // Debug logging
  console.log('AdminRoute Debug:', {
    loading,
    isAdmin,
    profile: {
      email: profile?.email,
      role: profile?.role
    }
  })

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  if (!isAdmin) {
    console.log('Not admin, redirecting to home')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function FinanceRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  
  if (profile?.role !== 'admin' && profile?.role !== 'finance_executive') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

import { FaviconSync } from './components/layout/FaviconSync'
import { useStatusBar } from './hooks/useStatusBar'

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
      <Routes>
        <Route path="*" element={<Maintenance />} />
      </Routes>
    )
  }

  return (
    <>
      <FaviconSync />
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
