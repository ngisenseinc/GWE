import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import { subscribeToProducts, subscribeToOrders, subscribeToPurchaseOrders, subscribeToSuppliers, subscribeToCustomers } from './services/supabaseService';
import { RBACProvider } from './context/RBACContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderStatus from './pages/OrderStatus';

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
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setIsAuthReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUser = async (authUser: any) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser({
        ...authUser,
        uid: authUser.id,
        role: profile?.role || 'employee',
        name: profile?.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        displayName: profile?.display_name,
        phone: profile?.phone,
        avatar: profile?.avatar_url,
      });
    } catch {
      setUser({ ...authUser, uid: authUser.id, role: 'employee' });
    }
    setIsAuthReady(true);
  };

  // Subscribe to data after auth is ready
  useEffect(() => {
    if (!isAuthReady) return;

    const unsubProducts = subscribeToProducts(setProducts);
    
    let unsubOrders: (() => void) | undefined;
    let unsubPOs: (() => void) | undefined;
    let unsubSuppliers: (() => void) | undefined;
    let unsubCustomers: (() => void) | undefined;

    if (user) {
      unsubOrders = subscribeToOrders(setSalesOrders);
      unsubPOs = subscribeToPurchaseOrders(setPurchaseOrders);
      unsubSuppliers = subscribeToSuppliers(setSuppliers);
      unsubCustomers = subscribeToCustomers(setCustomers);
    }

    return () => {
      unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubPOs) unsubPOs();
      if (unsubSuppliers) unsubSuppliers();
      if (unsubCustomers) unsubCustomers();
    };
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
