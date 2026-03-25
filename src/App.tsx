/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from './store/useStore';
import { subscribeToProducts, subscribeToOrders } from './services/firebaseService';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderStatus from './pages/OrderStatus';

export default function App() {
  const setUser = useStore(state => state.setUser);
  const setProducts = useStore(state => state.setProducts);
  const setSalesOrders = useStore(state => state.setSalesOrders);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ ...user, role: userData.role, name: userData.displayName || user.displayName });
          } else {
            setUser(user);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, [setUser]);

  const user = useStore(state => state.user);

  useEffect(() => {
    let unsubProducts: () => void;
    let unsubOrders: () => void;

    if (isAuthReady) {
      unsubProducts = subscribeToProducts(setProducts);
      
      if (user) {
        unsubOrders = subscribeToOrders(setSalesOrders);
      }
    }

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
    };
  }, [isAuthReady, user, setProducts, setSalesOrders]);

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}
