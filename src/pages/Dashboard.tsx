import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useRBAC } from '../context/RBACContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import {
  BarChart3, ShoppingCart, Package, Warehouse, Truck,
  ClipboardList, Users, UserSquare2, LineChart, Settings,
  Search, Bell, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import Overview from './dashboard/Overview';
import POS from './dashboard/POS';
import Inventory from './dashboard/Inventory';
import WarehousePage from './dashboard/Warehouse';
import Suppliers from './dashboard/Suppliers';
import Orders from './dashboard/Orders';
import Customers from './dashboard/Customers';
import Employees from './dashboard/Employees';
import Reports from './dashboard/Reports';
import SettingsPage from './dashboard/Settings';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['owner', 'employee'] },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['owner', 'employee'] },
  { section: 'Inventory', roles: ['owner', 'employee'] },
  { id: 'inventory', label: 'Products', icon: Package, roles: ['owner', 'employee'] },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse, roles: ['owner'] },
  { section: 'Commerce', roles: ['owner'] },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['owner'] },
  { id: 'orders', label: 'Orders', icon: ClipboardList, roles: ['owner'] },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['owner'] },
  { section: 'Admin', roles: ['owner'] },
  { id: 'employees', label: 'Employees', icon: UserSquare2, roles: ['owner'] },
  { id: 'reports', label: 'Reports', icon: LineChart, roles: ['owner'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner', 'employee'] },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const products = useStore(state => state.products);
  const navigate = useNavigate();
  const { role } = useRBAC();

  const lowStockCount = products.filter(p => p.status === 'low' || p.status === 'out').length;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Error signing out');
    }
  };

  const navigate2Page = (id: string) => {
    setActivePage(id);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'overview': return <Overview />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'warehouse': return <WarehousePage />;
      case 'suppliers': return <Suppliers />;
      case 'orders': return <Orders />;
      case 'customers': return <Customers />;
      case 'employees': return <Employees />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      default: return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#8A90A8]">
            <div className="text-4xl mb-4">🚧</div>
            <div className="font-bold">Coming Soon</div>
          </div>
        </div>
      );
    }
  };

  const pageTitle = NAV_ITEMS.find(i => i.id === activePage)?.label || 'Dashboard';
  const userInitial = (user?.name || user?.email || 'S').charAt(0).toUpperCase();
  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  const filteredNavItems = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(role || 'employee')
  );

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden font-sans text-[#0A0C14]">
      <Helmet>
        <title>{pageTitle} | GWE Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-[#080A0F] border-r border-white/8 flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "md:w-[68px] w-64" : "w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 h-16 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className={cn("flex items-center gap-2.5 min-w-0", isSidebarCollapsed && "md:justify-center md:w-full")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-sm shadow-[0_4px_12px_rgba(201,168,76,0.2)] shrink-0">🔧</div>
            <div className={cn("min-w-0", isSidebarCollapsed && "md:hidden")}>
              <div className="font-serif text-[13px] font-bold text-white truncate">God's Way</div>
              <div className="text-[9px] text-[#C9A84C] font-mono uppercase tracking-widest">Enterprise</div>
            </div>
          </div>
          <button className="md:hidden text-white/40 hover:text-white p-1 transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 py-4 no-scrollbar">
          {filteredNavItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx}>
                  <div className={cn("font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 px-2 mt-5 mb-2", isSidebarCollapsed && "md:hidden")}>{item.section}</div>
                  <div className={cn("hidden h-px bg-white/8 my-3 mx-2", isSidebarCollapsed && "md:block")} />
                </div>
              );
            }
            const Icon = item.icon!;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate2Page(item.id!)}
                title={isSidebarCollapsed ? item.label : ''}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 gap-3",
                  isSidebarCollapsed && "md:justify-center",
                  isActive
                    ? "bg-gradient-to-r from-[#C9A84C]/15 to-transparent text-[#E8C76A] border border-[#C9A84C]/20"
                    : "text-white/45 hover:bg-white/5 hover:text-white/80 border border-transparent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={cn("truncate flex-1 text-left", isSidebarCollapsed && "md:hidden")}>{item.label}</span>
                {isActive && !isSidebarCollapsed && <ChevronRight className="w-3 h-3 ml-auto opacity-50 md:block hidden" />}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className={cn(
          "p-3 border-t border-white/8 flex items-center gap-3",
          isSidebarCollapsed && "md:flex-col md:py-4"
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-sm font-black text-black shrink-0">
            {userInitial}
          </div>
          <div className={cn("flex-1 min-w-0", isSidebarCollapsed && "md:hidden")}>
            <div className="text-[13px] font-bold text-white truncate">{user?.name || user?.email?.split('@')[0] || 'Staff Member'}</div>
            <div className="text-[10px] text-[#C9A84C] font-mono uppercase tracking-wider">{user?.role || 'Employee'}</div>
          </div>
          <button onClick={handleLogout} className="text-white/25 hover:text-[#E63946] p-1.5 transition-colors rounded-lg hover:bg-[#E63946]/10 shrink-0" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F8FA] transition-all duration-300",
        isSidebarCollapsed ? "md:ml-[68px]" : "md:ml-64"
      )}>
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-[#E2E6EF] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#4A5270] p-1.5 hover:bg-[#F7F8FA] rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button className="hidden md:block text-[#4A5270] p-1.5 hover:bg-[#F7F8FA] rounded-lg transition-colors" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-[15px] font-bold text-[#0A0C14]">{pageTitle}</h2>
              <span className="text-[11px] text-[#8A90A8] font-mono">{today}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={cn(
              "sm:flex items-center gap-2 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl px-3 py-2 transition-all hidden",
              isSearchOpen ? "w-48" : "w-44"
            )}>
              <Search className="w-4 h-4 text-[#8A90A8]" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-[13px] text-[#0A0C14] placeholder:text-[#8A90A8] w-full"
              />
            </div>

            {/* POS quick-link */}
            <button
              onClick={() => navigate2Page('pos')}
              className="h-9 px-3 rounded-xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center gap-1.5 text-[#4A5270] hover:bg-[#EEF0F5] hover:text-[#0A0C14] transition-colors text-[12px] font-semibold"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">POS</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate2Page('inventory')}
              className="w-9 h-9 rounded-xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] hover:text-[#0A0C14] transition-colors relative"
              title={lowStockCount > 0 ? `${lowStockCount} stock alerts` : 'All stocked'}
            >
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E63946] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {lowStockCount > 9 ? '9+' : lowStockCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <button onClick={() => navigate2Page('settings')} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-black font-black text-sm hover:shadow-[0_4px_12px_rgba(201,168,76,0.3)] transition-all">
              {userInitial}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-hidden",
          activePage === 'pos' ? "flex flex-col" :
          ['overview', 'reports'].includes(activePage) ? "overflow-y-auto p-4 sm:p-6" :
          "overflow-y-auto p-4 sm:p-6"
        )}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
