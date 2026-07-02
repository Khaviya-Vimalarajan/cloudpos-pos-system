import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';

// Pages
import Landing from './features/landing/Landing';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Dashboard from './features/dashboard/Dashboard';
import POS from './features/pos/POS';
import Products from './features/products/Products';
import Inventory from './features/inventory/Inventory';
import Employees from './features/employees/Employees';
import Reports from './features/reports/Reports';
import Settings from './features/settings/Settings';
import Admin from './features/admin/Admin';
import ActivityLogs from './features/reports/ActivityLogs';
import Customers from './features/customers/Customers';
import Suppliers from './features/suppliers/Suppliers';
import Expenses from './features/expenses/Expenses';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* PUBLIC ROUTING */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* PROTECTED WORKSPACE ROUTING */}
        <Route element={<ProtectedRoute allowedRoles={['SuperAdmin', 'BusinessOwner', 'Cashier', 'InventoryManager']} />}>
          <Route element={<Layout />}>
            
            {/* Dashboard: Owner Only */}
            <Route element={<ProtectedRoute allowedRoles={['BusinessOwner']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/expenses" element={<Expenses />} />
            </Route>

            {/* POS Terminal & CRM: Owner & Cashier */}
            <Route element={<ProtectedRoute allowedRoles={['BusinessOwner', 'Cashier']} />}>
              <Route path="/pos" element={<POS />} />
              <Route path="/customers" element={<Customers />} />
            </Route>

            {/* Catalog, Stock & Vendors: Owner & Inventory Manager */}
            <Route element={<ProtectedRoute allowedRoles={['BusinessOwner', 'InventoryManager']} />}>
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
            </Route>

            {/* Sales logs/Reports: Owner & Cashier */}
            <Route element={<ProtectedRoute allowedRoles={['BusinessOwner', 'Cashier']} />}>
              <Route path="/reports" element={<Reports />} />
              <Route path="/sales" element={<Reports />} /> {/* Cashier redirect matching Reports view */}
            </Route>

            {/* Super Admin Control panel */}
            <Route element={<ProtectedRoute allowedRoles={['SuperAdmin']} />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/logs" element={<Admin />} />
            </Route>

          </Route>
        </Route>

        {/* CATCH-ALL Redirects */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
