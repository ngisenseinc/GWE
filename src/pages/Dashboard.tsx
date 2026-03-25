import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { 
  BarChart3, ShoppingCart, Package, Warehouse, Truck, 
  ClipboardList, Users, UserSquare2, LineChart, Settings, 
  Search, Bell, LogOut, Menu, X 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Helmet } from 'react-helmet-async';
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
  { id: 'inventory', label: 'Products', icon: Package, badge: 24, roles: ['owner', 'employee'] },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse, roles: ['owner'] },
  { section: 'Commerce', roles: ['owner'] },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['owner'] },
  { id: 'orders', label: 'Purchase Orders', icon: ClipboardList, badge: 3, badgeColor: 'bg-[#F39C12]', roles: ['owner'] },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['owner'] },
  { section: 'Admin', roles: ['owner'] },
  { id: 'employees', label: 'Employees', icon: UserSquare2, roles: ['owner'] },
  { id: 'reports', label: 'Reports', icon: LineChart, roles: ['owner'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner'] },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
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
      default: return <div className="p-10 text-center text-white/50">🚧 Coming Soon</div>;
    }
  };

  const pageTitle = NAV_ITEMS.find(i => i.id === activePage)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden font-sans text-[#0A0C14]">
      <Helmet>
        <title>{pageTitle} | God's Way Enterprise Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-[#080A0F] border-r border-white/10 flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "md:w-20 w-64" : "w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className={cn("flex items-center gap-2.5", isSidebarCollapsed && "md:justify-center w-full")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-sm shadow-[0_4px_16px_rgba(201,168,76,0.2)] shrink-0">
              🔧
            </div>
            <span className={cn("font-serif text-[13px] font-bold text-white truncate", isSidebarCollapsed && "md:hidden")}>God's Way</span>
          </div>
          <button className="md:hidden text-white/50 p-1 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 py-4">
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role || 'employee')).map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx}>
                  <div className={cn("font-mono text-[9px] tracking-widest uppercase text-white/25 px-2 mt-4 mb-2", isSidebarCollapsed && "md:hidden")}>{item.section}</div>
                  <div className={cn("hidden h-px bg-white/10 my-4 mx-2", isSidebarCollapsed && "md:block")} />
                </div>
              );
            }
            const Icon = item.icon!;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id!); setIsSidebarOpen(false); }}
                title={isSidebarCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5",
                  isSidebarCollapsed ? "md:justify-center gap-2.5" : "gap-2.5",
                  isActive ? "bg-[#C9A84C]/15 text-[#E8C76A] border border-[#C9A84C]/20" : "text-white/55 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={cn("truncate", isSidebarCollapsed && "md:hidden")}>{item.label}</span>
                {item.badge && (
                  <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full font-mono text-white", item.badgeColor || "bg-[#E63946]", isSidebarCollapsed && "md:hidden")}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={cn("p-4 border-t border-white/10 flex items-center", isSidebarCollapsed ? "md:justify-center md:flex-col md:gap-3 gap-2.5" : "gap-2.5")}>
          <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[15px] shrink-0">
            👑
          </div>
          <div className={cn("flex-1 min-w-0", isSidebarCollapsed && "md:hidden")}>
            <div className="text-[13px] font-semibold text-white truncate">{user?.name || user?.displayName || 'Staff Member'}</div>
            <div className="text-[10px] text-[#C9A84C] font-mono uppercase truncate">{user?.role || 'Employee'}</div>
          </div>
          <button onClick={handleLogout} className="text-white/30 hover:text-[#E63946] p-1 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F8FA] transition-all duration-300",
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-[#E2E6EF] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#4A5270] p-1" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button className="hidden md:block text-[#4A5270] p-1 hover:bg-[#F7F8FA] rounded-md transition-colors" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#0A0C14]">{pageTitle}</h2>
              <span className="text-xs text-[#8A90A8] hidden sm:block">Wednesday, 18 March 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#F7F8FA] border border-[#E2E6EF] rounded-full px-4 py-2 text-[13px] text-[#4A5270]">
              <Search className="w-4 h-4" />
              <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none w-44 text-[#0A0C14] placeholder:text-[#8A90A8]" />
            </div>
            <button onClick={() => setActivePage('pos')} className="w-9 h-9 rounded-xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] hover:text-[#0A0C14] transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#EEF0F5] hover:text-[#0A0C14] transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E63946] text-white text-[8px] font-bold flex items-center justify-center">5</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className={cn("flex-1 flex flex-col", ['overview', 'reports'].includes(activePage) ? "p-6 overflow-y-auto" : activePage === 'pos' ? "p-0 overflow-hidden" : "p-6 overflow-hidden")}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
