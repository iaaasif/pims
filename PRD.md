# Product Requirements Document (PRD)
# Project Inventory Management System

## 1. Executive Summary

### 1.1 Product Name
Project Inventory Management System (PIMS)

### 1.2 Product Vision
A comprehensive real-time inventory management system designed to track materials, manage purchases, and monitor project resources across multiple locations with role-based access control and approval workflows. This system aims to eliminate inventory discrepancies, streamline procurement processes, and provide complete visibility into material usage across all projects.

### 1.3 Business Objectives
- Reduce inventory management overhead by 40%
- Eliminate stockouts through real-time tracking and alerts
- Improve procurement cycle time by 30% through automated workflows
- Provide accurate, real-time inventory data for better decision-making
- Enable multi-project material visibility and allocation
- Create audit trails for all inventory movements

### 1.4 Target Users
- **Admin**: Full system access, approval authority, user management, system configuration
- **Project Managers**: Project-specific inventory management, requisition creation, transfer requests
- **Warehouse Staff**: Material tracking, stock updates, transfer execution
- **Procurement Team**: Purchase requisition processing, vendor management, order tracking
- **Finance Team**: Budget monitoring, purchase reports, vendor payment tracking

### 1.5 Key Features
- Real-time inventory tracking across multiple projects and locations
- Automated purchase requisition to purchase order workflow
- Role-based access control with approval hierarchies
- Material usage tracking and analytics
- Inter-project material transfer management
- Comprehensive reporting and dashboards
- Low stock alerts and notifications
- Dark/Light theme support

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization (Supabase Auth)

#### 2.1.1 User Registration
```javascript
// Registration function
async function register(email, password, fullName, phone) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone
      }
    }
  })
  
  if (error) throw error
  
  // Create profile entry
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      phone: phone,
      role: 'user'
    })
  
  return data
}
```

- **Required fields:**
  - Email Address (validated)
  - Password (minimum 8 characters)
  - Full Name
  - Phone Number (optional)
- **Default role**: User (requires admin upgrade for elevated permissions)
- **Email verification**: Optional (can be enabled in Supabase settings)
- **Password requirements**: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

#### 2.1.2 Admin Login
**Predefined Admin Account:**
- Email: `engr.aaasif@gmail.com`
- Password: `12345678`

```javascript
// Create admin user (run once in Supabase SQL Editor)
-- First, create the auth user via Supabase Dashboard Auth section
-- Then update their profile role:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'engr.aaasif@gmail.com';
```

**Login Function:**
```javascript
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  
  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()
  
  return { user: data.user, profile }
}
```

**Admin Capabilities:**
- Approve/reject purchase requisitions
- Create purchase orders from approved requisitions
- Manage all users (view, edit, delete, change roles)
- Access all system features and data
- Configure system settings
- View all reports across projects

#### 2.1.3 User Roles & Permissions (Row Level Security)

**Roles:**
- **Admin**: Full system access
- **Manager**: Create/edit projects, materials, requisitions; view reports
- **User**: View-only access, create requisitions (pending approval)

**RLS Policies Examples:**
```sql
-- Purchase Requisitions: Users can only view their own PRs
CREATE POLICY "Users view own PRs" ON purchase_requisitions
  FOR SELECT USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Only admins can approve PRs
CREATE POLICY "Admins can approve PRs" ON purchase_requisitions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    status IN ('approved', 'rejected')
  );

-- Managers and admins can create materials
CREATE POLICY "Managers can create materials" ON materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
```

**Session Management:**
```javascript
// Check auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User logged in
    fetchUserProfile(session.user.id)
  } else if (event === 'SIGNED_OUT') {
    // User logged out
    clearUserData()
  }
})

// Logout
async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current session
const { data: { session } } = await supabase.auth.getSession()
```

---

### 2.2 Dashboard

#### 2.2.1 Key Metrics (Real-time)
- Total Projects (active/completed)
- Total Locations
- Total Materials in inventory
- Pending Purchase Requisitions (count)
- Total Purchase Orders (current month)
- Low Stock Alerts
- Recent Activities (last 10 actions)

#### 2.2.2 Visual Components
- Material usage trends (chart)
- Purchase order status distribution (pie chart)
- Project-wise material allocation (bar chart)
- Top 5 most used materials
- Quick action buttons (Add Material, New Requisition, Transfer)

#### 2.2.3 Real-time Updates
- WebSocket/Socket.io integration for live data updates
- Auto-refresh on data changes from any user
- Notification badges for pending approvals

---

### 2.3 Location Management

#### 2.3.1 Add Location
- Location Name
- Location Code (auto-generated or manual)
- Address
- Contact Person
- Contact Number
- Status (Active/Inactive)
- Created Date/Time
- Created By

#### 2.3.2 Location List View
- Searchable and filterable table
- Columns: Name, Code, Address, Contact, Status, Actions
- Actions: Edit, View, Delete (with confirmation)
- Export to CSV/Excel

#### 2.3.3 Real-time Features
- Instant updates when locations are added/modified
- Live status changes

---

### 2.4 Project Management

#### 2.4.1 Add Project
- Project Name
- Project Code (unique identifier)
- Location (dropdown from Locations)
- Start Date
- Expected End Date
- Status (Planning/Active/On Hold/Completed)
- Project Manager (user selection)
- Budget (optional)
- Description
- Created Date/Time

#### 2.4.2 Project List View
- Filter by: Status, Location, Date Range
- Search by: Name, Code, Manager
- Columns: Code, Name, Location, Manager, Status, Start Date, Actions
- Actions: View Details, Edit, Archive

#### 2.4.3 Project Details Page
- Overview section
- Assigned materials list
- Material usage history
- Purchase history for this project
- Transfer history

---

### 2.5 Project Inventory

#### 2.5.1 Materials Management

**Add Material**
- Material Name
- Material Code (unique)
- Category (dropdown: Raw Material, Equipment, Tools, Consumables, etc.)
- Unit of Measurement (from Settings)
- Description
- Supplier (from Vendor list)
- Minimum Stock Level (alert threshold)
- Current Stock Quantity
- Unit Price
- Location
- Image (optional)
- Created Date/Time

**Material List View**
- Advanced filters: Category, Location, Stock Level, Supplier
- Search by: Name, Code, Category
- Columns: Code, Name, Category, Unit, Current Stock, Min Stock, Status, Actions
- Stock Status Indicators:
  - Green: Stock > Min Level
  - Yellow: Stock = Min Level ± 10%
  - Red: Stock < Min Level
- Bulk actions: Import CSV, Export, Update Prices

#### 2.5.2 Usage Tracking

**Record Usage**
- Select Project
- Select Material
- Quantity Used
- Date of Usage
- Used By (user)
- Purpose/Notes
- Remaining Stock (auto-calculated)

**Usage History**
- Filter by: Project, Material, Date Range, User
- Columns: Date, Project, Material, Quantity, Used By, Remaining Stock
- Export functionality
- Real-time updates when usage is recorded

#### 2.5.3 Real-time Inventory Updates
- Live stock level updates across all connected clients
- Automatic low-stock notifications
- Usage activity feed

---

### 2.6 Purchase Management

#### 2.6.1 Purchase Requisition (PR)

**Create Purchase Requisition**
- PR Number (auto-generated: PR-YYYYMMDD-XXX)
- Project (dropdown)
- Requested By (current user)
- Date of Request
- Required By Date
- Items:
  - Material (dropdown or add new)
  - Quantity
  - Unit
  - Estimated Unit Price
  - Total Price (auto-calculated)
  - Notes
- Add Multiple Items functionality
- Grand Total (auto-calculated)
- Justification/Purpose (text area)
- Status: Draft/Submitted/Approved/Rejected/Converted to PO
- Save as Draft or Submit for Approval

**Purchase Requisition List**
- Filters: Status, Project, Date Range, Requested By
- Columns: PR Number, Project, Requested By, Date, Total Amount, Status, Actions
- Status badges with colors:
  - Draft (Gray)
  - Submitted (Blue)
  - Approved (Green)
  - Rejected (Red)
  - Converted (Purple)
- Actions: View, Edit (if Draft), Approve (Admin only), Reject (Admin only), Convert to PO (Admin only)

**Approval Workflow**
- Only Admin can approve/reject PRs
- Approval notification to requester (real-time)
- Rejection requires reason (text input)
- Email notification on status change

**Real-time Features**
- Live status updates
- Notification bell for pending approvals (Admin)
- Auto-refresh on approval/rejection

#### 2.6.2 Purchase Order (PO)

**Create Purchase Order (from Approved PR)**
- Admin converts approved PR to PO
- PO Number (auto-generated: PO-YYYYMMDD-XXX)
- Vendor/Supplier (dropdown)
- Reference PR Number (linked)
- Project
- Order Date
- Expected Delivery Date
- Items (pre-filled from PR, editable):
  - Material
  - Quantity
  - Unit Price (negotiated price)
  - Tax/VAT %
  - Total
- Shipping Address (from Location)
- Terms & Conditions
- Notes
- Grand Total with Tax
- Status: Pending/Confirmed/Partially Received/Received/Cancelled
- Created By (Admin)

**Manual Purchase Order Creation**
- Admin can create PO without PR
- Same fields as above
- Reference: "Direct Purchase"

**Purchase Order List**
- Filters: Status, Vendor, Project, Date Range
- Columns: PO Number, Vendor, Project, Order Date, Total Amount, Status, Actions
- Actions: View, Edit, Mark as Received, Print, Cancel

**Receive Materials**
- Update inventory on delivery
- Partial receiving functionality
- Record receiving date
- Update PO status automatically

**Real-time Features**
- Live PO status updates
- Delivery notifications
- Auto-update inventory on receiving

#### 2.6.3 Purchase History

**Purchase History View**
- Complete record of all PRs and POs
- Combined view with toggle: All / PRs / POs
- Advanced filters:
  - Date Range
  - Project
  - Material
  - Vendor
  - Status
  - Amount Range
- Columns: Type (PR/PO), Number, Date, Project, Vendor, Total Amount, Status
- Detailed view popup with full information
- Export to Excel/PDF
- Print functionality

**Analytics**
- Total spending by project
- Spending by vendor
- Material-wise purchase trends
- Monthly/Quarterly spending reports

---

### 2.7 Transfer Management

#### 2.7.1 Transfer to Other Project

**Create Transfer**
- Transfer Number (auto-generated: TR-YYYYMMDD-XXX)
- From Project (dropdown)
- To Project (dropdown)
- Transfer Date
- Items:
  - Material
  - Quantity Available (from source project)
  - Quantity to Transfer
  - Unit
  - Reason
- Add Multiple Items
- Authorized By (current user)
- Notes
- Status: Pending/In Transit/Completed/Cancelled

**Transfer List**
- Filters: Status, From Project, To Project, Date Range
- Columns: Transfer #, From, To, Date, Items Count, Status, Actions
- Actions: View, Approve (if pending), Complete, Cancel

**Transfer Approval (if required)**
- Optional approval workflow
- Both project managers notified
- Real-time status updates

**Complete Transfer**
- Deduct from source project inventory
- Add to destination project inventory
- Update status to Completed
- Generate transfer receipt (printable)

**Real-time Features**
- Live transfer status updates
- Inventory auto-update on completion
- Notification to both project managers

---

### 2.8 Vendor/Supplier Management

#### 2.8.1 Add Vendor
- Vendor Name
- Vendor Code (unique)
- Contact Person
- Email
- Phone Number
- Address
- City/State/Zip
- Tax ID/Registration Number
- Payment Terms
- Credit Limit (optional)
- Status (Active/Inactive)
- Notes
- Created Date

#### 2.8.2 Vendor List View
- Search and filter functionality
- Columns: Code, Name, Contact, Phone, Email, Status, Actions
- Actions: View, Edit, Deactivate, View Purchase History

#### 2.8.3 Vendor Details Page
- Complete vendor information
- Purchase history with this vendor
- Total purchases amount
- Payment history (if integrated)
- Performance rating (optional)

---

### 2.9 Reports

#### 2.9.1 Inventory Reports
- **Current Stock Report**
  - All materials with current stock levels
  - Filter by location, project, category
  - Low stock alerts highlighted
  
- **Material Usage Report**
  - Usage by project, material, date range
  - Comparison charts
  
- **Inventory Valuation Report**
  - Total inventory value
  - Value by project/location/category

#### 2.9.2 Purchase Reports
- **Purchase Summary Report**
  - Total purchases by period
  - Vendor-wise spending
  - Project-wise spending
  
- **Purchase Order Status Report**
  - Pending, confirmed, received POs
  - Overdue deliveries
  
- **Vendor Performance Report**
  - On-time delivery rate
  - Quality issues
  - Total transactions

#### 2.9.3 Project Reports
- **Project Material Consumption**
  - Material usage vs. budget
  - Cost analysis
  
- **Project Purchase Summary**
  - All purchases for a project
  - Budget vs. actual

#### 2.9.4 Export Options
- PDF, Excel, CSV formats
- Print functionality
- Email report (future enhancement)
- Schedule automated reports (future enhancement)

---

### 2.10 Settings

#### 2.10.1 Unit Management
- Add/Edit/Delete units of measurement
- Examples: kg, lbs, pieces, meters, liters, boxes, etc.
- Abbreviation and full name
- Cannot delete if in use

#### 2.10.2 User Management (Admin Only)
- View all registered users
- User list with columns: Name, Email, Role, Status, Registered Date
- Actions:
  - Edit user details
  - Change user role
  - Activate/Deactivate user
  - Reset password
  - Delete user (with confirmation)
- Filter by role and status

#### 2.10.3 Theme Settings
- **Dark Mode**: Dark background with light text
- **Light Mode**: Light background with dark text
- Toggle switch in settings or header
- Preference saved per user in localStorage
- Smooth transition animation

#### 2.10.4 General Settings
- Company Name
- Company Logo upload
- Currency settings
- Date format preference
- Number format preference
- Default location
- Low stock threshold (global default)
- Email notifications on/off

---

## 3. Technical Requirements

### 3.1 Technology Stack

**Frontend**
- React 18+
- Vite (Build tool)
- React Router v6 (routing)
- State Management: Zustand or Redux Toolkit
- UI Framework: Tailwind CSS + shadcn/ui (recommended) or Material-UI
- Real-time: Supabase Realtime
- Forms: React Hook Form + Zod validation
- Charts: Recharts or Chart.js
- HTTP Client: @supabase/supabase-js
- Date Handling: date-fns or Day.js
- Toast Notifications: react-hot-toast or sonner

**Mobile App (Capacitor)**
- @capacitor/core - Core Capacitor functionality
- @capacitor/android - Android platform support
- @capacitor/status-bar - Status bar customization
- @capacitor/splash-screen - Splash screen control
- @capacitor/keyboard - Keyboard handling
- @capacitor/app - App lifecycle events
- @capacitor/network - Network status
- @capacitor/camera (optional) - Camera access for material images
- @capacitor/filesystem (optional) - File system access

**Backend** (Supabase)
- **Database**: PostgreSQL (Supabase-hosted)
- **Authentication**: Supabase Auth (Built-in JWT)
- **Real-time**: Supabase Realtime (WebSocket)
- **Storage**: Supabase Storage (for images/files)
- **API**: Auto-generated REST & GraphQL APIs
- **Functions**: Supabase Edge Functions (Deno)
- **Row Level Security (RLS)**: Database-level permissions

**Deployment**
- Web App: cPanel hosting (static files)
- Android App: Google Play Store or APK distribution
- Database: Supabase (fully managed)

### 3.2 Supabase Real-time Implementation

**Supabase Client Setup**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

**Real-time Subscriptions**
```javascript
// Subscribe to inventory updates
useEffect(() => {
  const channel = supabase
    .channel('inventory-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'materials'
      },
      (payload) => {
        console.log('Material change:', payload)
        if (payload.eventType === 'UPDATE') {
          updateMaterialInState(payload.new)
          toast.success(`${payload.new.name} stock updated`)
        } else if (payload.eventType === 'INSERT') {
          addMaterialToState(payload.new)
          toast.success('New material added')
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

**Real-time Features by Table**

**1. Materials Table**
```javascript
// Listen to stock changes
supabase
  .channel('materials')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'materials' },
    (payload) => {
      // Check if stock is below minimum
      if (payload.new.current_stock < payload.new.min_stock_level) {
        showLowStockAlert(payload.new)
      }
      refreshInventory()
    }
  )
  .subscribe()
```

**2. Purchase Requisitions Table**
```javascript
// Admin receives real-time PR notifications
supabase
  .channel('pr-notifications')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'purchase_requisitions' },
    (payload) => {
      if (currentUser.role === 'admin') {
        showNotification(`New PR: ${payload.new.pr_number}`)
        incrementPendingCount()
      }
    }
  )
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'purchase_requisitions' },
    (payload) => {
      // Notify requester when status changes
      if (payload.new.requested_by === currentUser.id) {
        if (payload.new.status === 'approved') {
          toast.success('Your PR has been approved!')
        } else if (payload.new.status === 'rejected') {
          toast.error('Your PR was rejected')
        }
      }
    }
  )
  .subscribe()
```

**3. Purchase Orders Table**
```javascript
// Project managers get notified of new POs
supabase
  .channel('po-updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'purchase_orders' },
    (payload) => {
      refreshPOList()
      if (payload.eventType === 'UPDATE' && 
          payload.new.status === 'received') {
        // Auto-update inventory when PO is received
        updateInventoryFromPO(payload.new.id)
      }
    }
  )
  .subscribe()
```

**4. Transfers Table**
```javascript
// Both project managers notified
supabase
  .channel('transfers')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'transfers' },
    (payload) => {
      const { from_project_id, to_project_id } = payload.new
      if (currentUser.project_id === from_project_id || 
          currentUser.project_id === to_project_id) {
        showNotification('Transfer status updated')
        refreshTransfers()
      }
    }
  )
  .subscribe()
```

**Real-time Dashboard Example**
```javascript
function Dashboard() {
  const [metrics, setMetrics] = useState({})
  const [activities, setActivities] = useState([])

  useEffect(() => {
    // Initial load
    fetchDashboardData()

    // Subscribe to multiple tables
    const materialChannel = supabase
      .channel('dashboard-materials')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'materials' },
        () => fetchDashboardData()
      )
      .subscribe()

    const prChannel = supabase
      .channel('dashboard-pr')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_requisitions' },
        () => fetchDashboardData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(materialChannel)
      supabase.removeChannel(prChannel)
    }
  }, [])

  return (
    <div>
      <MetricsGrid metrics={metrics} />
      <ActivityFeed activities={activities} />
    </div>
  )
}
```

**Presence for Online Users (Optional)**
```javascript
// Track who's online
const channel = supabase.channel('online-users')

// Send presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', Object.keys(state).length)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: currentUser.id,
        user_name: currentUser.name,
        online_at: new Date().toISOString()
      })
    }
  })
```

**Broadcast for Custom Events**
```javascript
// Send custom events
const channel = supabase.channel('custom-events')

// Send event
channel.send({
  type: 'broadcast',
  event: 'approval-needed',
  payload: { pr_id: '123', message: 'Please review' }
})

// Receive event
channel.on('broadcast', { event: 'approval-needed' }, (payload) => {
  console.log('Approval needed:', payload)
})
```

### 3.7 Application Architecture (React + Supabase)

**Frontend Architecture**
```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── Notification.jsx
│   │   └── ProtectedRoute.jsx
│   ├── dashboard/
│   │   ├── MetricCard.jsx
│   │   ├── ActivityFeed.jsx
│   │   └── Charts.jsx
│   ├── inventory/
│   │   ├── MaterialList.jsx
│   │   ├── MaterialForm.jsx
│   │   ├── MaterialCard.jsx
│   │   └── UsageHistory.jsx
│   ├── purchase/
│   │   ├── PRList.jsx
│   │   ├── PRForm.jsx
│   │   ├── POList.jsx
│   │   └── POForm.jsx
│   ├── projects/
│   │   ├── ProjectList.jsx
│   │   ├── ProjectForm.jsx
│   │   └── ProjectDetails.jsx
│   ├── transfers/
│   │   ├── TransferList.jsx
│   │   └── TransferForm.jsx
│   ├── vendors/
│   │   ├── VendorList.jsx
│   │   └── VendorForm.jsx
│   ├── reports/
│   │   ├── InventoryReport.jsx
│   │   ├── PurchaseReport.jsx
│   │   └── ProjectReport.jsx
│   └── settings/
│       ├── UnitManagement.jsx
│       ├── UserManagement.jsx
│       └── ThemeSettings.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Locations.jsx
│   ├── Projects.jsx
│   ├── Materials.jsx
│   ├── PurchaseRequisitions.jsx
│   ├── PurchaseOrders.jsx
│   ├── Transfers.jsx
│   ├── Vendors.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
├── lib/
│   ├── supabase.js         // Supabase client setup
│   └── supabaseHelpers.js  // Common query functions
├── hooks/
│   ├── useSupabase.js      // Custom Supabase hooks
│   ├── useAuth.js          // Authentication hook
│   ├── useRealtime.js      // Real-time subscriptions
│   └── useNotification.js  // Notification system
├── store/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── inventorySlice.js
│   │   ├── purchaseSlice.js
│   │   └── settingsSlice.js
│   └── store.js
├── utils/
│   ├── validation.js       // Zod schemas
│   ├── formatters.js       // Date, currency formatters
│   ├── constants.js        // App constants
│   └── permissions.js      // Role check utilities
├── styles/
│   ├── globals.css
│   └── tailwind.css
├── App.jsx
└── main.jsx
```

**Supabase Backend** (Managed Service)
- Database: PostgreSQL with RLS
- Authentication: Built-in JWT auth
- Storage: File storage for images
- Edge Functions: Serverless functions (optional)
- Real-time: WebSocket subscriptions
- Auto-generated APIs: REST & GraphQL

**No Custom Backend Server Needed!**
All backend functionality is provided by Supabase.

### 3.8 State Management Strategy (Zustand + Supabase)

**Zustand Store Example** (Simpler alternative to Redux)
```javascript
// stores/useAuthStore.js
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      set({ user: session.user, profile, loading: false })
    } else {
      set({ user: null, profile: null, loading: false })
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))
```

```javascript
// stores/useInventoryStore.js
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useInventoryStore = create((set, get) => ({
  materials: [],
  loading: false,
  filters: {},
  
  fetchMaterials: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('materials')
      .select('*, supplier:vendors(name), location:locations(name)')
      .order('name')
    
    if (!error) {
      set({ materials: data, loading: false })
    }
  },
  
  addMaterial: (material) => {
    set(state => ({
      materials: [material, ...state.materials]
    }))
  },
  
  updateMaterial: (id, updates) => {
    set(state => ({
      materials: state.materials.map(m =>
        m.id === id ? { ...m, ...updates } : m
      )
    }))
  },
  
  deleteMaterial: (id) => {
    set(state => ({
      materials: state.materials.filter(m => m.id !== id)
    }))
  },
  
  setFilters: (filters) => set({ filters })
}))
```

**Custom Hooks with Supabase Realtime**
```javascript
// hooks/useRealtime.js
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useInventoryStore } from '@/stores/useInventoryStore'

export function useRealtimeMaterials() {
  const { addMaterial, updateMaterial, deleteMaterial } = useInventoryStore()
  
  useEffect(() => {
    const channel = supabase
      .channel('materials-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'materials' },
        (payload) => {
          addMaterial(payload.new)
          toast.success('New material added')
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'materials' },
        (payload) => {
          updateMaterial(payload.new.id, payload.new)
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'materials' },
        (payload) => {
          deleteMaterial(payload.old.id)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
```

**Using in Components**
```javascript
// components/inventory/MaterialList.jsx
import { useEffect } from 'react'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useRealtimeMaterials } from '@/hooks/useRealtime'

export function MaterialList() {
  const { materials, loading, fetchMaterials } = useInventoryStore()
  
  // Enable real-time updates
  useRealtimeMaterials()
  
  useEffect(() => {
    fetchMaterials()
  }, [])
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div>
      {materials.map(material => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  )
}
```

**Alternative: Redux Toolkit with Supabase**
```javascript
// store/slices/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'

export const fetchMaterials = createAsyncThunk(
  'inventory/fetchMaterials',
  async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
    if (error) throw error
    return data
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    materials: [],
    loading: false,
    error: null
  },
  reducers: {
    materialAdded: (state, action) => {
      state.materials.unshift(action.payload)
    },
    materialUpdated: (state, action) => {
      const index = state.materials.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.materials[index] = action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false
        state.materials = action.payload
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { materialAdded, materialUpdated } = inventorySlice.actions
export default inventorySlice.reducer
```

### 3.5 Supabase Client API Usage

**Authentication**
```javascript
// Register
const { data, error } = await supabase.auth.signUp({ email, password })

// Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Logout
const { error } = await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Update password
const { data, error } = await supabase.auth.updateUser({ password: newPassword })
```

**Inventory Operations**
```javascript
// Get all materials with filters
const { data, error } = await supabase
  .from('materials')
  .select(`
    *,
    supplier:vendors(name),
    location:locations(name)
  `)
  .eq('status', 'active')
  .gte('current_stock', 0)
  .order('name')

// Get material by ID
const { data, error } = await supabase
  .from('materials')
  .select('*')
  .eq('id', materialId)
  .single()

// Create material
const { data, error } = await supabase
  .from('materials')
  .insert({
    name,
    code,
    category,
    unit,
    min_stock_level,
    current_stock,
    unit_price,
    location_id
  })

// Update material
const { data, error } = await supabase
  .from('materials')
  .update({ current_stock: newStock })
  .eq('id', materialId)

// Delete material
const { error } = await supabase
  .from('materials')
  .delete()
  .eq('id', materialId)

// Get low stock items
const { data, error } = await supabase
  .from('materials')
  .select('*')
  .lt('current_stock', 'min_stock_level')
```

**Usage Tracking**
```javascript
// Record material usage
const { data, error } = await supabase
  .from('material_usage')
  .insert({
    project_id,
    material_id,
    quantity,
    date_used,
    used_by: user.id,
    purpose
  })
// Note: Stock will be auto-updated by database trigger

// Get usage history
const { data, error } = await supabase
  .from('material_usage')
  .select(`
    *,
    project:projects(name),
    material:materials(name, unit),
    user:profiles(full_name)
  `)
  .order('date_used', { ascending: false })

// Usage by project
const { data, error } = await supabase
  .from('material_usage')
  .select('*')
  .eq('project_id', projectId)
```

**Purchase Requisitions**
```javascript
// Get all PRs with filters
const { data, error } = await supabase
  .from('purchase_requisitions')
  .select(`
    *,
    project:projects(name),
    requester:profiles!requested_by(full_name),
    items:pr_items(
      *,
      material:materials(name)
    )
  `)
  .eq('status', 'submitted')

// Create PR
const { data: pr, error } = await supabase
  .from('purchase_requisitions')
  .insert({
    project_id,
    requested_by: user.id,
    required_by_date,
    justification,
    status: 'submitted'
  })
  .select()
  .single()

// Add PR items
const { error: itemsError } = await supabase
  .from('pr_items')
  .insert(
    items.map(item => ({
      pr_id: pr.id,
      material_id: item.material_id,
      quantity: item.quantity,
      unit: item.unit,
      estimated_unit_price: item.price
    }))
  )

// Approve PR (Admin only)
const { error } = await supabase
  .from('purchase_requisitions')
  .update({
    status: 'approved',
    approved_by: adminUserId,
    approved_date: new Date().toISOString()
  })
  .eq('id', prId)

// Reject PR (Admin only)
const { error } = await supabase
  .from('purchase_requisitions')
  .update({
    status: 'rejected',
    approved_by: adminUserId,
    rejection_reason: reason
  })
  .eq('id', prId)
```

**Purchase Orders**
```javascript
// Create PO from approved PR
const { data: po, error } = await supabase
  .from('purchase_orders')
  .insert({
    vendor_id,
    pr_id,
    project_id,
    order_date,
    expected_delivery_date,
    shipping_address,
    tax_percentage,
    created_by: user.id,
    status: 'pending'
  })
  .select()
  .single()

// Add PO items (from PR items)
const { data: prItems } = await supabase
  .from('pr_items')
  .select('*')
  .eq('pr_id', prId)

const { error: poItemsError } = await supabase
  .from('po_items')
  .insert(
    prItems.map(item => ({
      po_id: po.id,
      material_id: item.material_id,
      quantity: item.quantity,
      unit_price: item.estimated_unit_price
    }))
  )

// Mark PR as converted
await supabase
  .from('purchase_requisitions')
  .update({ status: 'converted' })
  .eq('id', prId)

// Get all POs
const { data, error } = await supabase
  .from('purchase_orders')
  .select(`
    *,
    vendor:vendors(name),
    project:projects(name),
    items:po_items(
      *,
      material:materials(name, unit)
    )
  `)

// Mark PO as received (updates inventory via trigger)
const { error } = await supabase
  .from('purchase_orders')
  .update({ status: 'received' })
  .eq('id', poId)
```

**Transfers**
```javascript
// Create transfer
const { data: transfer, error } = await supabase
  .from('transfers')
  .insert({
    from_project_id,
    to_project_id,
    authorized_by: user.id,
    status: 'pending'
  })
  .select()
  .single()

// Add transfer items
const { error: itemsError } = await supabase
  .from('transfer_items')
  .insert(
    items.map(item => ({
      transfer_id: transfer.id,
      material_id: item.material_id,
      quantity: item.quantity,
      reason: item.reason
    }))
  )

// Complete transfer
const { error } = await supabase
  .from('transfers')
  .update({ status: 'completed' })
  .eq('id', transferId)

// Get transfers
const { data, error } = await supabase
  .from('transfers')
  .select(`
    *,
    from_project:projects!from_project_id(name),
    to_project:projects!to_project_id(name),
    items:transfer_items(
      *,
      material:materials(name, unit)
    )
  `)
```

**Projects & Locations**
```javascript
// CRUD operations follow similar pattern
const { data, error } = await supabase
  .from('projects')
  .select('*, location:locations(name)')
  
const { data, error } = await supabase
  .from('locations')
  .insert({ name, code, address })
```

**File Upload (Material Images)**
```javascript
// Upload image to Supabase Storage
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `materials/${fileName}`

const { error: uploadError } = await supabase.storage
  .from('material-images')
  .upload(filePath, file)

if (uploadError) throw uploadError

// Get public URL
const { data } = supabase.storage
  .from('material-images')
  .getPublicUrl(filePath)

// Save URL to material record
await supabase
  .from('materials')
  .update({ image_url: data.publicUrl })
  .eq('id', materialId)
```

**Reports & Analytics**
```javascript
// Dashboard metrics
const { data: projectCount } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true })

const { data: lowStock } = await supabase
  .from('materials')
  .select('*')
  .lt('current_stock', 'min_stock_level')

const { data: pendingPRs } = await supabase
  .from('purchase_requisitions')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'submitted')

// Custom queries using RPC
const { data, error } = await supabase
  .rpc('get_project_spending', { project_id: projectId })
```

### 3.3 Supabase Database Schema

#### Database Tables Structure

**1. users (Extended from auth.users)**
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**2. locations**
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  contact_person TEXT,
  contact_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert" ON locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
```

**3. projects**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  location_id UUID REFERENCES locations,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  manager_id UUID REFERENCES auth.users,
  budget DECIMAL(15, 2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view projects" ON projects
  FOR SELECT USING (true);
```

**4. vendors**
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  credit_limit DECIMAL(15, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view vendors" ON vendors
  FOR SELECT USING (true);
```

**5. materials**
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  supplier_id UUID REFERENCES vendors,
  min_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 0,
  current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  location_id UUID REFERENCES locations,
  image_url TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view materials" ON materials
  FOR SELECT USING (true);

-- Function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock < NEW.min_stock_level THEN
    -- You can add notification logic here
    RAISE NOTICE 'Low stock alert for material: %', NEW.name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER low_stock_check
  AFTER UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();
```

**6. material_usage**
```sql
CREATE TABLE material_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects NOT NULL,
  material_id UUID REFERENCES materials NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  date_used DATE NOT NULL DEFAULT CURRENT_DATE,
  used_by UUID REFERENCES auth.users NOT NULL,
  purpose TEXT,
  remaining_stock DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE material_usage ENABLE ROW LEVEL SECURITY;

-- Function to update stock after usage
CREATE OR REPLACE FUNCTION update_stock_on_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE materials 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.material_id;
  
  NEW.remaining_stock := (
    SELECT current_stock FROM materials WHERE id = NEW.material_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usage_stock_update
  BEFORE INSERT ON material_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_usage();
```

**7. purchase_requisitions**
```sql
CREATE TABLE purchase_requisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects NOT NULL,
  requested_by UUID REFERENCES auth.users NOT NULL,
  date_requested DATE NOT NULL DEFAULT CURRENT_DATE,
  required_by_date DATE,
  justification TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'converted')),
  total_amount DECIMAL(15, 2) DEFAULT 0,
  approved_by UUID REFERENCES auth.users,
  approved_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchase_requisitions ENABLE ROW LEVEL SECURITY;

-- Auto-generate PR number
CREATE OR REPLACE FUNCTION generate_pr_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.pr_number := 'PR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(nextval('pr_sequence')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE pr_sequence START 1;

CREATE TRIGGER set_pr_number
  BEFORE INSERT ON purchase_requisitions
  FOR EACH ROW
  EXECUTE FUNCTION generate_pr_number();
```

**8. pr_items**
```sql
CREATE TABLE pr_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_id UUID REFERENCES purchase_requisitions ON DELETE CASCADE,
  material_id UUID REFERENCES materials,
  material_name TEXT NOT NULL, -- In case material doesn't exist yet
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  estimated_unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * estimated_unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update PR total when items change
CREATE OR REPLACE FUNCTION update_pr_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_requisitions
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM pr_items
    WHERE pr_id = COALESCE(NEW.pr_id, OLD.pr_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.pr_id, OLD.pr_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pr_total_update
  AFTER INSERT OR UPDATE OR DELETE ON pr_items
  FOR EACH ROW
  EXECUTE FUNCTION update_pr_total();
```

**9. purchase_orders**
```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES vendors NOT NULL,
  pr_id UUID REFERENCES purchase_requisitions,
  project_id UUID REFERENCES projects NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  shipping_address TEXT,
  terms TEXT,
  notes TEXT,
  subtotal DECIMAL(15, 2) DEFAULT 0,
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'partially_received', 'received', 'cancelled')),
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Auto-generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(nextval('po_sequence')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE po_sequence START 1;

CREATE TRIGGER set_po_number
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_po_number();
```

**10. po_items**
```sql
CREATE TABLE po_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID REFERENCES purchase_orders ON DELETE CASCADE,
  material_id UUID REFERENCES materials NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  received_quantity DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update PO totals
CREATE OR REPLACE FUNCTION update_po_total()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(15, 2);
  v_tax_amount DECIMAL(15, 2);
  v_tax_percentage DECIMAL(5, 2);
BEGIN
  SELECT 
    COALESCE(SUM(total_price), 0),
    tax_percentage
  INTO v_subtotal, v_tax_percentage
  FROM purchase_orders po
  LEFT JOIN po_items poi ON poi.po_id = po.id
  WHERE po.id = COALESCE(NEW.po_id, OLD.po_id)
  GROUP BY po.tax_percentage;
  
  v_tax_amount := v_subtotal * (v_tax_percentage / 100);
  
  UPDATE purchase_orders
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_subtotal + v_tax_amount,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.po_id, OLD.po_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER po_total_update
  AFTER INSERT OR UPDATE OR DELETE ON po_items
  FOR EACH ROW
  EXECUTE FUNCTION update_po_total();
```

**11. transfers**
```sql
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_number TEXT UNIQUE NOT NULL,
  from_project_id UUID REFERENCES projects NOT NULL,
  to_project_id UUID REFERENCES projects NOT NULL,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  authorized_by UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_projects CHECK (from_project_id != to_project_id)
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Auto-generate Transfer number
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transfer_number := 'TR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(nextval('transfer_sequence')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE transfer_sequence START 1;

CREATE TRIGGER set_transfer_number
  BEFORE INSERT ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION generate_transfer_number();
```

**12. transfer_items**
```sql
CREATE TABLE transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id UUID REFERENCES transfers ON DELETE CASCADE,
  material_id UUID REFERENCES materials NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update inventory on transfer completion
CREATE OR REPLACE FUNCTION process_transfer_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- This would need additional logic to track project-specific inventory
    -- For now, we'll just log the transfer
    RAISE NOTICE 'Transfer % completed', NEW.transfer_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transfer_completion
  AFTER UPDATE ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION process_transfer_completion();
```

**13. units**
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  abbreviation TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view units" ON units
  FOR SELECT USING (true);

-- Insert default units
INSERT INTO units (name, abbreviation) VALUES
  ('Pieces', 'pcs'),
  ('Kilograms', 'kg'),
  ('Meters', 'm'),
  ('Liters', 'L'),
  ('Boxes', 'box'),
  ('Tons', 'ton'),
  ('Dozen', 'doz'),
  ('Square Meters', 'sqm');
```

**14. settings**
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('company_name', '"My Company"'),
  ('currency', '"USD"'),
  ('date_format', '"MM/DD/YYYY"'),
  ('low_stock_threshold', '10');
```

### 3.4 Security Requirements (Supabase RLS)
- **Row Level Security (RLS)**: Enforced at database level
- **Authentication**: Supabase Auth with JWT tokens
- **Password hashing**: Handled automatically by Supabase
- **Role-based access control**: Implemented via RLS policies
- **Input validation**: Client-side (Zod) + Database constraints
- **SQL injection prevention**: Parameterized queries (automatic)
- **XSS protection**: React escapes by default
- **CORS**: Configured in Supabase dashboard
- **API rate limiting**: Supabase handles this
- **Secure password reset**: Built into Supabase Auth

**Environment Variables**
```bash
# .env.local
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**RLS Policy Best Practices**
```sql
-- Always enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create specific policies for each operation
CREATE POLICY "policy_name" ON table_name
  FOR SELECT|INSERT|UPDATE|DELETE
  USING (condition)
  WITH CHECK (condition);

-- Test policies thoroughly
SELECT * FROM table_name; -- Should respect RLS
```

### 3.6 Supabase Project Setup Guide

**Step 1: Create Supabase Project**
1. Go to https://supabase.com
2. Create new project
3. Note down project URL and anon key
4. Enable email auth in Authentication settings

**Step 2: Database Setup**
Run the SQL from section 3.3 in SQL Editor:
1. Create all tables
2. Enable RLS on all tables
3. Create policies
4. Create functions and triggers
5. Insert default data (units, admin user)

**Step 3: Storage Setup**
1. Create bucket: `material-images`
2. Make bucket public
3. Set policies:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'material-images');

-- Allow public read access
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'material-images');
```

**Step 4: Edge Functions (Optional)**
For complex operations:
```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { type, userId, message } = await req.json()
  
  // Send email, SMS, or push notification
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

**Step 5: Configure Authentication**
```sql
-- Create admin user profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth-users-table',
  'engr.aaasif@gmail.com',
  'Admin User',
  'admin'
);
```

### 3.5 Performance Requirements
- Page load time: < 2 seconds
- Real-time update latency: < 500ms
- Support 100+ concurrent users
- Efficient pagination (50 items per page)
- Lazy loading for large lists
- Optimized database queries with indexes
- Image optimization and compression

---

## 4. User Interface Requirements

### 4.1 Layout Structure
- **Header/Navbar**: Logo, Navigation Menu, User Profile Dropdown, Notifications, Theme Toggle
- **Sidebar**: Collapsible navigation with icons
- **Main Content Area**: Breadcrumbs, Page Title, Content
- **Footer**: Copyright, Version, Links

### 4.2 Navigation Menu Structure
```
├── Dashboard
├── Locations
│   ├── All Locations
│   └── Add Location
├── Projects
│   ├── All Projects
│   └── Add Project
├── Inventory
│   ├── Materials
│   │   ├── All Materials
│   │   └── Add Material
│   ├── Usage History
│   └── Low Stock Alerts
├── Purchases
│   ├── Purchase Requisitions
│   │   ├── All PRs
│   │   └── Create PR
│   ├── Purchase Orders
│   │   ├── All POs
│   │   └── Create PO
│   └── Purchase History
├── Transfers
│   ├── All Transfers
│   └── Create Transfer
├── Vendors
│   ├── All Vendors
│   └── Add Vendor
├── Reports
│   ├── Inventory Reports
│   ├── Purchase Reports
│   └── Project Reports
└── Settings
    ├── Units
    ├── Users (Admin only)
    ├── Theme
    └── General Settings
```

### 4.3 Responsive Design

#### 4.3.1 Breakpoints
```css
/* Mobile First Approach */
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+
```

#### 4.3.2 Mobile Responsive Requirements (Priority: High)

**Navigation & Layout**
- **Mobile (< 768px)**:
  - Hamburger menu icon (☰) in top-left corner
  - Collapsible sidebar that slides from left
  - Overlay/backdrop when sidebar is open
  - Bottom navigation bar for quick access (Dashboard, Inventory, Purchases, More)
  - Sticky header with logo, notifications, and user menu
  - Single column layout for all content
  - Full-width cards and forms
  
- **Tablet (768px - 1023px)**:
  - Collapsed sidebar with icons only (expandable on hover/tap)
  - Two-column grid for cards
  - Optimized table views with horizontal scroll
  - Full navigation visible
  
- **Desktop (1024px+)**:
  - Full sidebar always visible
  - Multi-column layouts
  - Full tables without scroll
  - Dashboard widgets in 3-4 column grid

**Data Tables - Mobile Optimization**
```javascript
// Mobile: Card View
<div className="mobile-card">
  <div className="card-header">
    <h3>PR-20260120-001</h3>
    <span className="badge">Pending</span>
  </div>
  <div className="card-body">
    <div className="info-row">
      <span className="label">Project:</span>
      <span className="value">Project A</span>
    </div>
    <div className="info-row">
      <span className="label">Amount:</span>
      <span className="value">$5,250.00</span>
    </div>
    <div className="info-row">
      <span className="label">Date:</span>
      <span className="value">Jan 20, 2026</span>
    </div>
  </div>
  <div className="card-actions">
    <button>View</button>
    <button>Approve</button>
  </div>
</div>

// Tablet/Desktop: Table View
<table className="responsive-table">
  <thead>
    <tr>
      <th>PR Number</th>
      <th>Project</th>
      <th>Amount</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {/* Standard table rows */}
  </tbody>
</table>
```

**Forms - Mobile Optimization**
- Single column layout on mobile
- Full-width input fields
- Large touch targets (minimum 44px × 44px)
- Floating labels for space efficiency
- Bottom sheet modals instead of centered popups
- Sticky "Save" button at bottom on mobile
- Auto-focus disabled on mobile (prevents keyboard popup)
- Date pickers optimized for touch
- Dropdown select with native mobile picker

**Dashboard - Mobile Layout**
```
Mobile Dashboard:
┌─────────────────────────┐
│ Header (Sticky)         │
├─────────────────────────┤
│ Quick Stats (Swipeable) │
│ [Total Projects] →      │
├─────────────────────────┤
│ Pending Approvals Card  │
├─────────────────────────┤
│ Low Stock Alerts Card   │
├─────────────────────────┤
│ Recent Activities       │
├─────────────────────────┤
│ Quick Actions (FAB)     │
└─────────────────────────┘

Tablet Dashboard:
┌───────────────────────────────┐
│ Header                        │
├──────────────┬────────────────┤
│ Stats Grid   │ Stats Grid     │
│ (2 columns)  │                │
├──────────────┴────────────────┤
│ Chart Area (Full Width)       │
├──────────────┬────────────────┤
│ Alerts       │ Activities     │
└──────────────┴────────────────┘
```

**Touch Interactions**
- Swipe gestures:
  - Swipe left on list items to reveal actions (Edit/Delete)
  - Pull-to-refresh on mobile lists
  - Swipe between tabs/sections
- Long press for context menus
- Pinch to zoom on charts (optional)
- Double-tap to expand cards

**Mobile-Specific Features**
- **Bottom Sheet for Filters**: Slide-up panel for filter options
- **FAB (Floating Action Button)**: Quick actions (+ icon)
  - Tap to show: Add Material, Create PR, New Transfer
- **Progressive Disclosure**: Show essential info first, "Show More" to expand
- **Infinite Scroll**: Load more items as user scrolls (instead of pagination)
- **Offline Mode Indicator**: Show banner when connection lost
- **Loading Skeletons**: Placeholder UI while data loads

**Input Optimizations**
- Numeric keyboard for quantity/price fields
- Email keyboard for email inputs
- Search with autocomplete/suggestions
- Camera integration for material image upload
- Location picker using device GPS (for addresses)

**Performance Optimizations**
- Lazy load images
- Virtual scrolling for long lists (React Virtualized/React Window)
- Code splitting by route
- Compress images before upload
- Cache API responses
- Debounce search inputs
- Optimize bundle size (< 200KB initial load)

**Orientation Support**
- Portrait mode (primary)
- Landscape mode (optional, optimized for tablets)
- Adjust layout based on screen orientation
- Lock orientation for specific features (camera)

#### 4.3.3 Component Responsive Examples

**Responsive Header**
```jsx
<header className="header">
  {/* Mobile: Hamburger + Logo + Icons */}
  <div className="md:hidden flex items-center justify-between">
    <button onClick={toggleSidebar}>☰</button>
    <img src="/logo.png" alt="Logo" className="h-8" />
    <div className="flex gap-2">
      <NotificationIcon />
      <UserMenu />
    </div>
  </div>
  
  {/* Desktop: Full Navigation */}
  <div className="hidden md:flex items-center justify-between">
    <img src="/logo.png" alt="Logo" className="h-10" />
    <Navigation />
    <div className="flex gap-4">
      <SearchBar />
      <NotificationIcon />
      <ThemeToggle />
      <UserMenu />
    </div>
  </div>
</header>
```

**Responsive Material Card**
```jsx
// Mobile: Vertical stack
<div className="material-card mobile:flex-col">
  <img src={material.image} className="mobile:w-full mobile:h-48" />
  <div className="mobile:p-4">
    <h3>{material.name}</h3>
    <p className="mobile:text-sm">{material.description}</p>
    <div className="mobile:flex-col mobile:gap-2">
      <span>Stock: {material.stock}</span>
      <span>Unit: {material.unit}</span>
    </div>
  </div>
  <div className="actions mobile:flex mobile:w-full">
    <button className="mobile:flex-1">Edit</button>
    <button className="mobile:flex-1">View</button>
  </div>
</div>
```

**Responsive Table Implementation**
```jsx
function ResponsiveTable({ data, columns }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return (
      <div className="mobile-cards">
        {data.map(item => (
          <MobileCard key={item.id} data={item} />
        ))}
      </div>
    );
  }
  
  return (
    <table className="desktop-table">
      <thead>
        <tr>
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            {columns.map(col => (
              <td key={col.key}>{item[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**CSS Media Query Examples**
```css
/* Mobile First */
.container {
  padding: 1rem;
  max-width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.sidebar {
  position: fixed;
  left: -280px;
  width: 280px;
  transition: left 0.3s;
}

.sidebar.open {
  left: 0;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sidebar {
    position: relative;
    left: 0;
    width: 80px; /* Collapsed */
  }
  
  .sidebar:hover {
    width: 280px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  .sidebar {
    width: 280px; /* Always expanded */
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Touch-Friendly Elements**
```css
/* Minimum touch target size */
.btn,
.link,
.icon-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Larger spacing on mobile */
.mobile-list-item {
  padding: 16px;
  margin-bottom: 12px;
}

/* Swipe action indicator */
.swipe-actions {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  transform: translateX(100%);
  transition: transform 0.3s;
}

.list-item.swiped .swipe-actions {
  transform: translateX(0);
}
```

#### 4.3.4 Mobile Testing Requirements
- Test on actual devices (iOS and Android)
- Test on various screen sizes (iPhone SE, iPhone 14, iPad, Samsung Galaxy)
- Test touch interactions (tap, swipe, pinch, long-press)
- Test keyboard behavior (appearing/disappearing)
- Test in portrait and landscape modes
- Test with slow network (3G simulation)
- Test offline functionality
- Verify accessibility on mobile (screen readers, voice control)

### 4.4 Accessibility
- ARIA labels
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader compatibility

---

## 5. User Workflows

### 5.1 Purchase Workflow
```
1. User creates Purchase Requisition (PR)
   → Status: Submitted
   → Real-time notification to Admin

2. Admin reviews PR
   → Approves: Status: Approved
     → Admin creates Purchase Order (PO) from PR
     → Status: PR becomes "Converted to PO"
   → Rejects: Status: Rejected
     → User notified with rejection reason

3. Admin sends PO to Vendor
   → Status: Confirmed

4. Materials received
   → Admin marks PO as "Received"
   → Inventory automatically updated
   → Project stock increased

5. All updates reflect real-time across all users
```

### 5.2 Material Transfer Workflow
```
1. User creates Transfer Request
   → From Project A to Project B
   → Status: Pending

2. Transfer approved (if required)
   → Status: In Transit

3. User completes transfer
   → Project A inventory decreased
   → Project B inventory increased
   → Status: Completed
   → Both project managers notified

4. Real-time inventory updates
```

### 5.3 User Registration & Access Workflow
```
1. New user registers via Registration Form
   → Account created with "User" role
   → Email verification (optional)

2. User logs in
   → Limited access based on role

3. Admin reviews new users in User Management
   → Can upgrade role to Manager or Admin
   → Can activate/deactivate users

4. All user changes reflected in real-time
```

---

## 6. Validation Rules

### 6.1 Form Validations
- **Email**: Valid email format
- **Password**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- **Phone**: Valid phone number format
- **Dates**: End date >= Start date
- **Quantities**: Positive numbers only
- **Prices**: Positive decimal numbers
- **Unique Fields**: Code, Email (check duplicates)

### 6.2 Business Logic Validations
- Cannot transfer more than available stock
- Cannot use more materials than in stock
- Cannot delete location/project/vendor if referenced
- Cannot approve own PR
- PO can only be created from approved PR
- Transfer destination cannot be same as source

---

## 7. Notification Requirements

### 7.1 Real-time Notifications
- New PR created → Notify Admin
- PR approved/rejected → Notify Requester
- PO created → Notify relevant project manager
- Low stock alert → Notify Admin and Project Manager
- Transfer completed → Notify both project managers
- New user registration → Notify Admin

### 7.2 Notification UI
- Bell icon with badge count in header
- Dropdown panel with recent notifications
- Mark as read functionality
- Click to navigate to related item

---

## 8. Future Enhancements (Phase 2)

- Mobile app (React Native)
- Barcode/QR code scanning for materials
- Advanced analytics dashboard
- Budget tracking and forecasting
- Supplier portal for direct PO submission
- Multi-currency support
- Document attachment (invoices, receipts)
- Audit trail for all transactions
- Email notifications
- SMS alerts for critical items
- Integration with accounting software
- Automated reorder points
- Material return/waste tracking
- Equipment maintenance tracking

---

## 9. Success Metrics

- **Performance**: 99.9% uptime
- **User Adoption**: 90% of users active within first month
- **Real-time**: < 500ms update latency
- **Data Accuracy**: 99.5% inventory accuracy
- **User Satisfaction**: 4.5/5 rating

---

## 10. Capacitor Native App Configuration

### 10.1 Project Setup

**Step 1: Install Dependencies**
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npm install @capacitor/status-bar @capacitor/splash-screen
npm install @capacitor/keyboard @capacitor/app @capacitor/network
```

**Step 2: Initialize Capacitor**
```bash
npx cap init

# Prompts:
# App name: Project Inventory Management
# Package ID: com.yourcompany.inventory (e.g., com.example.pims)
# Web directory: dist
```

**Step 3: Add Android Platform**
```bash
npx cap add android
```

### 10.2 Vite Configuration for Capacitor

**vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: true, // Allow access from mobile device
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Important for Capacitor
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

### 10.3 Capacitor Configuration

**capacitor.config.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.inventory',
  appName: 'Project Inventory',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development testing on device
    // url: 'http://192.168.1.100:5173',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true // Disable in production
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'light', // light or dark
      backgroundColor: '#1f2937', // Your header color
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

export default config;
```

### 10.4 Android Full-Screen Configuration

**SOLUTION 1: Status Bar & Navigation Handling in App**

**src/App.jsx or src/main.jsx**
```javascript
import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeApp()
    }
  }, [])

  const initializeApp = async () => {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#1f2937' })
    await StatusBar.setOverlaysWebView({ overlay: false })
    
    // Show status bar (don't hide it for full screen)
    await StatusBar.show()
    
    // Handle keyboard
    Keyboard.addListener('keyboardWillShow', info => {
      console.log('keyboard will show with height:', info.keyboardHeight)
    })
    
    Keyboard.addListener('keyboardWillHide', () => {
      console.log('keyboard will hide')
    })
    
    // Handle app state
    CapApp.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive)
    })
    
    // Handle back button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp()
      } else {
        window.history.back()
      }
    })
  }

  return (
    <div className="app-container">
      {/* Your app content */}
    </div>
  )
}

export default App
```

**SOLUTION 2: Android Manifest Configuration**

**android/app/src/main/AndroidManifest.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.inventory">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:exported="true"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
</manifest>
```

**android/app/src/main/res/values/styles.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <!-- Customize your theme here -->
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:windowTranslucentStatus">false</item>
        <item name="android:windowTranslucentNavigation">false</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:statusBarColor">@color/colorPrimaryDark</item>
        <item name="android:navigationBarColor">@color/navigationBarColor</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme">
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">false</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowIsTranslucent">false</item>
    </style>
</resources>
```

**android/app/src/main/res/values/colors.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#1f2937</color>
    <color name="colorPrimaryDark">#111827</color>
    <color name="colorAccent">#3b82f6</color>
    <color name="navigationBarColor">#000000</color>
</resources>
```

**SOLUTION 3: MainActivity Configuration**

**android/app/src/main/java/com/yourcompany/inventory/MainActivity.java**
```java
package com.yourcompany.inventory;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Make app use full screen (hide status bar and navigation)
        // OPTION 1: Hide both status bar and navigation (true fullscreen)
        // getWindow().getDecorView().setSystemUiVisibility(
        //     View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        //     | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        //     | View.SYSTEM_UI_FLAG_FULLSCREEN
        //     | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        //     | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        //     | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        // );
        
        // OPTION 2: Show status bar but hide navigation buttons (recommended)
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
        
        // OPTION 3: Show both but make them transparent (best UX)
        // getWindow().setFlags(
        //     WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
        //     WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        // );
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Keep navigation hidden when window regains focus
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }
}
```

### 10.5 CSS Adjustments for Android

**src/index.css or src/App.css**
```css
/* Android safe area handling */
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* For devices with notch */
.app-container {
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
  /* Safe area insets for iOS */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Android-specific styles */
@supports (-webkit-touch-callout: none) {
  .app-container {
    height: -webkit-fill-available;
  }
}

/* Prevent overscroll */
.app-container {
  overscroll-behavior: contain;
}

/* Hide scrollbar on mobile */
.app-container::-webkit-scrollbar {
  display: none;
}
```

### 10.6 Platform Detection Hook

**src/hooks/usePlatform.js**
```javascript
import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const [platform, setPlatform] = useState({
    isNative: false,
    isAndroid: false,
    isIOS: false,
    isWeb: true
  })

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform()
    const platform = Capacitor.getPlatform()
    
    setPlatform({
      isNative,
      isAndroid: platform === 'android',
      isIOS: platform === 'ios',
      isWeb: platform === 'web'
    })
  }, [])

  return platform
}
```

**Usage in Components:**
```javascript
function Header() {
  const { isAndroid } = usePlatform()
  
  return (
    <header className={isAndroid ? 'android-header' : 'web-header'}>
      {/* Header content */}
    </header>
  )
}
```

### 10.7 Build Process

**package.json scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "android:dev": "cap run android",
    "android:build": "npm run build && npx cap sync android && npx cap open android",
    "android:sync": "npx cap sync android",
    "ios:build": "npm run build && npx cap sync ios && npx cap open ios"
  }
}
```

**Build Steps:**
```bash
# 1. Build web app
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Choose APK
#    - Select release build variant
#    - Sign with your keystore
#    - Build APK
```

### 10.8 Android Signing Configuration

**Generate Keystore:**
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

**android/app/build.gradle**
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../my-release-key.keystore")
            storePassword "your-password"
            keyAlias "my-key-alias"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 10.9 cPanel Deployment (Web Version)

**Build for Web:**
```bash
npm run build
# Creates dist/ folder
```

**Deploy to cPanel:**
1. Compress dist/ folder to dist.zip
2. Upload to cPanel File Manager
3. Extract in public_html/ directory
4. Configure .htaccess for React Router:

**public_html/.htaccess**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable CORS if needed
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 10.10 Testing on Android Device

**Method 1: USB Debugging**
```bash
# Enable USB debugging on Android device
# Connect device via USB
adb devices

# Run app
npm run android:dev
```

**Method 2: Development Server**
```bash
# Update capacitor.config.ts
server: {
  url: 'http://YOUR_LOCAL_IP:5173',
  cleartext: true
}

# Sync and rebuild
npx cap sync android
```

### 10.11 App Icons and Splash Screen

**Generate icons using:**
- https://icon.kitchen
- Or use: https://capacitorjs.com/docs/guides/splash-screens-and-icons

**Place generated files in:**
```
android/app/src/main/res/
├── mipmap-hdpi/
├── mipmap-mdpi/
├── mipmap-xhdpi/
├── mipmap-xxhdpi/
└── mipmap-xxxhdpi/
```

**Splash screen:**
```
android/app/src/main/res/drawable/
└── splash.png (2732x2732px)
```

### 10.12 Common Issues & Solutions

**Issue 1: White screen after build**
```javascript
// Check capacitor.config.ts
server: {
  androidScheme: 'https' // Not 'http'
}
```

**Issue 2: Status bar visible even after hiding**
```java
// In MainActivity.java, use IMMERSIVE_STICKY flag
View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
```

**Issue 3: Keyboard pushing content up**
```xml
<!-- In AndroidManifest.xml -->
android:windowSoftInputMode="adjustResize"
```

**Issue 4: Network requests failing**
```xml
<!-- Add to AndroidManifest.xml -->
android:usesCleartextTraffic="true"
```

### 10.13 Performance Optimization

```javascript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Materials = lazy(() => import('./pages/Materials'))

// Image optimization
<img 
  src={imageUrl} 
  loading="lazy"
  decoding="async"
  alt="Material"
/>

// Virtual scrolling for long lists
import { FixedSizeList } from 'react-window'
```

## 11. Deliverables

### Phase 1 (MVP - Web + Android)
- ✅ User authentication and authorization
- ✅ Dashboard with real-time metrics
- ✅ Location, Project, Material management
- ✅ Purchase Requisition with approval workflow
- ✅ Purchase Order creation and management
- ✅ Material usage tracking
- ✅ Transfer management
- ✅ Vendor management
- ✅ Basic reports
- ✅ Settings (Units, Users, Theme)
- ✅ Real-time updates across all modules
- ✅ Mobile responsive design
- ✅ **Capacitor Android app** (APK ready)
- ✅ **cPanel deployment** (web version)
- ✅ **Full-screen Android app** (no status bar/nav issues)

### Deployment Artifacts
1. **Web Application**
   - Static files (dist/) for cPanel
   - .htaccess configuration
   - Environment configuration

2. **Android Application**
   - Signed APK file (release build)
   - App icons and splash screens
   - Source code with Capacitor integration
   - Build documentation

3. **Documentation**
   - User manual
   - Admin guide
   - API documentation (Supabase)
   - Deployment guide (cPanel + Android)
   - Capacitor configuration guide

### Timeline (14 weeks)
- **Week 1-2**: Project setup, Vite + React, Supabase integration, authentication, database design
- **Week 3-4**: Dashboard, Locations, Projects modules
- **Week 5-6**: Materials, Usage tracking, Vendors
- **Week 7-8**: Purchase Requisition & Purchase Order with approval workflow
- **Week 9**: Transfers, Reports, Analytics
- **Week 10**: Settings, Real-time integration, Notifications
- **Week 11**: Mobile responsive design optimization
- **Week 12**: Capacitor integration, Android configuration, full-screen fixes
- **Week 13**: Testing (web + Android), bug fixes, performance optimization
- **Week 14**: Deployment (cPanel + APK build), documentation, training

---

## 11. Appendix

### 11.1 Sample Data
**Admin Account**
- Email: engr.aaasif@gmail.com
- Password: 12345678

**Sample Units**
- Pieces (pcs)
- Kilograms (kg)
- Meters (m)
- Liters (L)
- Boxes (box)
- Tons (ton)

**Sample Material Categories**
- Raw Materials
- Equipment
- Tools
- Consumables
- Safety Items
- Office Supplies

**Sample Project Statuses**
- Planning
- Active
- On Hold
- Completed
- Cancelled

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | Product Team | Initial PRD creation |

**Approval**
- Product Owner: _________________
- Technical Lead: _________________
- Stakeholder: _________________

---

**End of Document**
