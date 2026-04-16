import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { getProducts, getOrders, getSuppliers, getCustomers, getEmployees } from './api/data';
import { RBACProvider } from './context/RBACContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderStatus from './pages/OrderStatus';
import * as authService from './services/authService';

function AppWrapper() {
  const setUser = useStore(state => state.setUser);
  const setIsAuthReady = useStore(state => state.setIsAuthReady);
  const setProducts = useStore(state => state.setProducts);
  const setSalesOrders = useStore(state => state.setSalesOrders);
  const setPurchaseOrders = useStore(state => state.setPurchaseOrders);
  const setSuppliers = useStore(state => state.setSuppliers);
  const setCustomers = useStore(state => state.setCustomers);
  const isAuthReady = useStore(state => state.isAuthReady);
  const user = useStore(state => state.user);

  useEffect(() => {
    // Check initial authentication status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Try to get current user with stored token
      const currentUser = await authService.getCurrentUser();
      setUser({
        ...currentUser,
        uid: currentUser.id,
        role: currentUser.role,
        name: currentUser.display_name || currentUser.email?.split('@')[0],
        displayName: currentUser.display_name,
        phone: currentUser.phone,
        avatar: currentUser.avatar_url,
      });
    } catch (error) {
      // Not authenticated or token invalid
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  };

  // Fetch data periodically instead of using real-time subscriptions
  useEffect(() => {
    if (!isAuthReady) return;

    const fetchData = async () => {
      try {
        // Fetch all data
        const [productsData, ordersData, suppliersData, customersData, employeesData] = await Promise.all([
          getProducts(),
          getOrders(),
          getSuppliers(),
          getCustomers(),
          getEmployees()
        ]);

        // Update store with fetched data
        setProducts(productsData);
        setSalesOrders(ordersData.sales || []);
        setPurchaseOrders(ordersData.purchases || []);
        setSuppliers(suppliersData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch data immediately
    fetchData();

    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [isAuthReady, !!user, setProducts, setSalesOrders, setPurchaseOrders, setSuppliers, setCustomers]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-3xl shadow-[0_8px_32px_rgba(201,168,76,0.3)] animate-pulse">
            🔧
          </div>
          <div className="text-white/40 text-sm font-mono">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <RBACProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </RBACProvider>
    </Router>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AppWrapper />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0F1117',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#2ECC71', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#E63946', secondary: '#fff' },
          },
        }}
      />
    </HelmetProvider>
  );
}
