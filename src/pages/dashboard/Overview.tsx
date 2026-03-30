import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, AlertTriangle, Truck, TrendingUp, Package } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../context/RBACContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, isToday, isYesterday, parseISO } from 'date-fns';

function StatCard({ title, value, change, icon: Icon, color, sub }: any) {
  return (
    <div className="bg-white border border-[#E2E6EF] rounded-2xl p-5 sm:p-6 relative overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
      <div className={cn("absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center sm:w-12 sm:h-12 sm:top-5 sm:right-5 sm:rounded-2xl")} style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
      </div>
      <div className="text-[11px] sm:text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-2">{title}</div>
      <div className="text-2xl sm:text-3xl font-black text-[#0A0C14] mb-1.5 font-serif">{value}</div>
      {change !== undefined && (
        <div className={cn("text-[11px] flex items-center gap-1 font-semibold", change >= 0 ? "text-[#2ECC71]" : "text-[#E63946]")}>
          {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}% vs yesterday
        </div>
      )}
      {sub && !change && <div className="text-[11px] text-[#8A90A8] font-mono">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0C14] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <div className="text-[11px] text-white/50 mb-1 font-mono">{label}</div>
        <div className="text-white font-bold">GHS {payload[0].value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const { isOwner } = useRBAC();
  const salesOrders = useStore(state => state.salesOrders);
  const products = useStore(state => state.products);

  const stats = useMemo(() => {
    const todayOrders = salesOrders.filter(o => {
      try { return isToday(parseISO(o.time)) || o.time.includes(format(new Date(), 'MMM d')); } catch { return false; }
    });
    const yesterdayOrders = salesOrders.filter(o => {
      try { return isYesterday(parseISO(o.time)); } catch { return false; }
    });

    const todayRevenue = todayOrders.filter(o => o.status !== 'refund').reduce((s, o) => s + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.filter(o => o.status !== 'refund').reduce((s, o) => s + o.total, 0);
    const revenueChange = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

    const lowStockCount = products.filter(p => p.status === 'low' || p.status === 'out').length;

    return {
      todayRevenue,
      todaySales: todayOrders.length,
      yesterdaySales: yesterdayOrders.length,
      revenueChange,
      lowStockCount,
      totalRevenue: salesOrders.filter(o => o.status !== 'refund').reduce((s, o) => s + o.total, 0),
    };
  }, [salesOrders, products]);

  // Chart data: last 10 days
  const chartData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const day = subDays(new Date(), 9 - i);
      const dayLabel = format(day, 'MMM d');
      const dayOrders = salesOrders.filter(o => {
        try { return o.time.includes(dayLabel); } catch { return false; }
      });
      return {
        day: format(day, 'd MMM'),
        revenue: dayOrders.filter(o => o.status !== 'refund').reduce((s, o) => s + o.total, 0),
      };
    });
  }, [salesOrders]);

  const recentSales = useMemo(() => salesOrders.slice(0, 8), [salesOrders]);

  const lowStockAlerts = useMemo(() =>
    products.filter(p => p.status === 'low' || p.status === 'out').slice(0, 5)
  , [products]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`GHS ${stats.todayRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={DollarSign}
          color="#C9A84C"
        />
        <StatCard
          title="Sales Today"
          value={stats.todaySales}
          change={stats.yesterdaySales > 0 ? Math.round(((stats.todaySales - stats.yesterdaySales) / stats.yesterdaySales) * 100) : 0}
          icon={ShoppingCart}
          color="#2ECC71"
        />
        <StatCard
          title="Low / Out of Stock"
          value={stats.lowStockCount}
          sub={stats.lowStockCount > 0 ? "Needs attention" : "All good!"}
          icon={AlertTriangle}
          color="#E63946"
        />
        {isOwner ? (
          <StatCard
            title="Total Revenue"
            value={`GHS ${stats.totalRevenue.toLocaleString()}`}
            sub={`${salesOrders.length} total orders`}
            icon={TrendingUp}
            color="#3498DB"
          />
        ) : (
          <StatCard
            title="Products"
            value={products.length}
            sub={`${products.filter(p => p.status === 'in').length} in stock`}
            icon={Package}
            color="#9B59B6"
          />
        )}
      </div>

      {/* Chart + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isOwner && (
          <div className="lg:col-span-2 bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
            <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#0A0C14]">Revenue — Last 10 Days</h3>
                <div className="text-[12px] text-[#8A90A8] font-mono mt-0.5">GHS {stats.totalRevenue.toLocaleString()} total</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C9A84C]" />
                <span className="text-xs text-[#8A90A8]">Revenue</span>
              </div>
            </div>
            <div className="p-5 px-6 pb-6">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8A90A8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#8A90A8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `${v > 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#C9A84C10' }} />
                  <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Alerts Panel */}
        <div className={cn("bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden", !isOwner && "lg:col-span-3")}>
          <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center gap-2">
            <div className="relative flex h-4 w-4 items-center justify-center">
              {lowStockAlerts.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-40" />}
              <span className="relative text-[15px]">🔔</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Stock Alerts</h3>
            {lowStockAlerts.length > 0 && (
              <span className="ml-auto bg-[#E63946] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{lowStockAlerts.length}</span>
            )}
          </div>
          <div className="p-4 px-5 flex flex-col gap-3">
            {lowStockAlerts.length === 0 ? (
              <div className="py-6 text-center text-[#8A90A8] text-sm">
                <div className="text-2xl mb-2">✅</div>
                All products are well stocked!
              </div>
            ) : lowStockAlerts.map(p => (
              <div key={p.id} className="flex items-start gap-3 py-3 border-b border-[#F0F2F7] last:border-0 last:pb-0">
                <div className="relative flex h-2 w-2 min-w-[8px] mt-1.5">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-50", p.status === 'out' ? "bg-[#E63946]" : "bg-[#F39C12]")} />
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", p.status === 'out' ? "bg-[#E63946]" : "bg-[#F39C12]")} />
                </div>
                <div>
                  <div className="text-[13px] text-[#0A0C14] font-medium leading-snug">{p.name}</div>
                  <div className="text-[11px] text-[#8A90A8] mt-0.5 font-mono">{p.status === 'out' ? 'Out of Stock' : `${p.stock} units remaining`}</div>
                </div>
              </div>
            ))}
            {products.filter(p => p.status === 'low' || p.status === 'out').length > 5 && (
              <div className="text-center text-[12px] text-[#C9A84C] font-bold py-2">
                +{products.filter(p => p.status === 'low' || p.status === 'out').length - 5} more alerts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
        <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#0A0C14]">Recent Sales</h3>
          <span className="text-[12px] text-[#8A90A8] font-mono">{salesOrders.length} total orders</span>
        </div>

        {recentSales.length === 0 ? (
          <div className="py-16 text-center text-[#8A90A8] flex flex-col items-center gap-3">
            <ShoppingCart className="w-10 h-10 opacity-20" />
            <span className="text-sm">No sales yet. Complete a sale in POS to see it here.</span>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8FA] border-b border-[#E2E6EF]">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Time'].map(h => (
                      <th key={h} className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(s => (
                    <tr key={s.id} className="border-b border-[#F0F2F7] last:border-0 hover:bg-[#F7F8FA] transition-colors">
                      <td className="p-3.5 px-4"><span className="font-mono text-[11px] text-[#C9A84C]">{s.id}</span></td>
                      <td className="p-3.5 px-4 font-medium text-[#0A0C14] text-[13px]">{s.customer}</td>
                      <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{s.items.reduce((sum, i) => sum + i.qty, 0)} items</td>
                      <td className="p-3.5 px-4 font-bold text-[#0A0C14] text-[13px]">GHS {s.total.toLocaleString()}</td>
                      <td className="p-3.5 px-4 text-[13px] text-[#4A5270] capitalize">{s.payment}</td>
                      <td className="p-3.5 px-4">
                        <span className={cn("inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border",
                          s.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                          s.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                          "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                        )}>
                          {s.status === 'partial_refund' ? 'partial refund' : s.status}
                        </span>
                      </td>
                      <td className="p-3.5 px-4 text-[12px] text-[#8A90A8]">{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden flex flex-col gap-3 p-4 bg-[#F7F8FA]">
              {recentSales.map(s => (
                <div key={s.id} className="bg-white border border-[#E2E6EF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-[11px] text-[#C9A84C] mb-0.5">{s.id}</div>
                      <div className="text-[14px] font-bold text-[#0A0C14]">{s.customer}</div>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      s.status === 'paid' ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" :
                      s.status === 'pending' ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20" :
                      "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20"
                    )}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8A90A8]">{s.items.reduce((sum, i) => sum + i.qty, 0)} items · {s.payment}</span>
                    <span className="font-bold text-[#0A0C14]">GHS {s.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
