import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, AlertTriangle, Truck } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Overview() {
  const user = useStore(state => state.user);
  const isOwner = user?.role === 'owner';
  const salesOrders = useStore(state => state.salesOrders);
  const RECENT_SALES = salesOrders.slice(0, 5).map(order => ({
    id: order.id,
    customer: order.customer,
    items: order.items.reduce((sum, item) => sum + item.qty, 0),
    total: `GHS ${order.total.toLocaleString()}`,
    payment: order.payment,
    status: order.status,
    time: order.time
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-4 sm:p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A84C] to-transparent" />
          <div className="text-[10px] sm:text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-1 sm:mb-2">Today's Revenue</div>
          <div className="text-xl sm:text-3xl font-bold text-[#0A0C14] mb-1 sm:mb-1.5 font-serif">GHS 12,840</div>
          <div className="text-[10px] sm:text-xs flex items-center gap-1 text-[#2ECC71]"><ArrowUpRight className="w-3 h-3" /> <span className="hidden sm:inline">18% vs yesterday</span><span className="sm:hidden">18%</span></div>
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-lg sm:text-xl text-[#C9A84C]"><DollarSign className="w-4 h-4 sm:w-5 sm:h-5" /></div>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-4 sm:p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2ECC71] to-transparent" />
          <div className="text-[10px] sm:text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-1 sm:mb-2">Sales Today</div>
          <div className="text-xl sm:text-3xl font-bold text-[#0A0C14] mb-1 sm:mb-1.5 font-serif">47</div>
          <div className="text-[10px] sm:text-xs flex items-center gap-1 text-[#2ECC71]"><ArrowUpRight className="w-3 h-3" /> <span className="hidden sm:inline">8 more than yesterday</span><span className="sm:hidden">+8</span></div>
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#2ECC71]/10 flex items-center justify-center text-lg sm:text-xl text-[#2ECC71]"><ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /></div>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-4 sm:p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E63946] to-transparent" />
          <div className="text-[10px] sm:text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-1 sm:mb-2">Low Stock</div>
          <div className="text-xl sm:text-3xl font-bold text-[#0A0C14] mb-1 sm:mb-1.5 font-serif">24</div>
          <div className="text-[10px] sm:text-xs flex items-center gap-1 text-[#E63946]"><ArrowDownRight className="w-3 h-3" /> <span className="hidden sm:inline">Requires attention</span><span className="sm:hidden">Attention</span></div>
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#E63946]/10 flex items-center justify-center text-lg sm:text-xl text-[#E63946]"><AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /></div>
        </div>

        {isOwner && (
          <div className="bg-white border border-[#E2E6EF] rounded-2xl p-4 sm:p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3498DB] to-transparent" />
            <div className="text-[10px] sm:text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-1 sm:mb-2">Suppliers</div>
            <div className="text-xl sm:text-3xl font-bold text-[#0A0C14] mb-1 sm:mb-1.5 font-serif">12</div>
            <div className="text-[10px] sm:text-xs flex items-center gap-1 text-[#8A90A8]"><span className="hidden sm:inline">3 pending POs</span><span className="sm:hidden">3 pending</span></div>
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#3498DB]/10 flex items-center justify-center text-lg sm:text-xl text-[#3498DB]"><Truck className="w-4 h-4 sm:w-5 sm:h-5" /></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isOwner && (
          <div className="lg:col-span-2 bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
            <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0A0C14]">Sales Chart — Last 12 Days</h3>
              <span className="text-xs text-[#8A90A8]">GHS 98,420 total</span>
            </div>
            <div className="p-5 px-6">
              <div className="h-40 bg-gradient-to-b from-[#C9A84C]/10 to-transparent rounded-lg relative overflow-hidden flex items-end gap-1 p-2">
                {[60,80,45,90,70,85,100,65,75,88,55,92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-b from-[#C9A84C] to-[#C9A84C]/40 min-h-[4px] transition-all duration-500" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-[#8A90A8] mt-2 font-mono">
                <span>Mar 6</span><span>Mar 9</span><span>Mar 12</span><span>Mar 15</span><span>Mar 18</span>
              </div>
            </div>
          </div>
        )}

        <div className={cn("bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden", !isOwner && "lg:col-span-3")}>
          <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center gap-2">
            <div className="relative flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-40"></span>
              <span className="relative text-[15px]">🔔</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Alerts</h3>
          </div>
          <div className="p-4 px-5 flex flex-col gap-3">
            {[
              { color: 'bg-[#E63946]', text: 'AC Compressor (Toyota Camry) — only 3 units left', sub: 'Reorder point: 5', urgent: true },
              { color: 'bg-[#F39C12]', text: 'Purchase Order #PO-2026-018 awaiting confirmation', sub: 'Sent 2 days ago' },
              { color: 'bg-[#3498DB]', text: 'New customer Mechanics Workshop #7 registered', sub: 'Today at 10:22am' },
              { color: 'bg-[#F39C12]', text: 'Suzuki Swift Radiator — only 2 units remaining', sub: 'Reorder point: 3', urgent: true },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-[#E2E6EF] last:border-0 last:pb-0">
                <div className="relative flex h-2 w-2 min-w-[8px] mt-1.5">
                  {alert.urgent && <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-50", alert.color)}></span>}
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", alert.color)}></span>
                </div>
                <div>
                  <div className="text-[13px] text-[#4A5270] leading-snug">{alert.text}</div>
                  <div className="text-[11px] text-[#8A90A8] mt-0.5 font-mono">{alert.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
        <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#0A0C14]">Recent Sales</h3>
          <button className="bg-[#C9A84C] text-black px-3.5 py-2 rounded-lg text-xs font-bold hover:-translate-y-0.5 transition-transform">+ New Sale</button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#E2E6EF]">
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Sale ID</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Customer</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Items</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Total</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Payment</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Status</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SALES.map((s, i) => (
                <tr key={i} className="border-b border-[#E2E6EF] last:border-0 hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-3.5 px-4"><span className="font-mono text-[11px] text-[#C9A84C]">{s.id}</span></td>
                  <td className="p-3.5 px-4 font-medium text-[#0A0C14]">{s.customer}</td>
                  <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{s.items} items</td>
                  <td className="p-3.5 px-4 font-bold text-[#0A0C14]">{s.total}</td>
                  <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{s.payment}</td>
                  <td className="p-3.5 px-4">
                    <span className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border",
                      s.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                      s.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                      "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                    )}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 px-4 text-[12px] text-[#8A90A8]">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-[#F7F8FA]">
          {RECENT_SALES.map((s, i) => (
            <div key={i} className="bg-white border border-[#E2E6EF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[11px] text-[#C9A84C] mb-1">{s.id}</div>
                  <div className="text-[14px] font-semibold text-[#0A0C14] leading-snug">{s.customer}</div>
                </div>
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                  s.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                  s.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                  "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                )}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Total</span>
                  <span className="text-[14px] font-bold text-[#0A0C14]">{s.total}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Payment</span>
                  <span className="text-[12px] text-[#4A5270]">{s.payment}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EF]">
                <div className="text-[12px] font-medium text-[#4A5270]">{s.items} items</div>
                <div className="text-[12px] text-[#8A90A8]">{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
