import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../context/RBACContext';
import { TrendingUp, Package, ShoppingCart, CreditCard, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const PAYMENT_COLORS = {
  cash: '#C9A84C',
  momo: '#2ECC71',
  card: '#3498DB',
  vodafone: '#E63946',
  credit: '#9B59B6',
};

export default function Reports() {
  const { isOwner } = useRBAC();
  const salesOrders = useStore(state => state.salesOrders);
  const products = useStore(state => state.products);

  const stats = useMemo(() => {
    const totalRevenue = salesOrders.filter(o => o.status !== 'refund').reduce((s, o) => s + o.total, 0);
    const totalItems = salesOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
    const avgOrderValue = salesOrders.length > 0 ? totalRevenue / salesOrders.length : 0;
    const refundedOrders = salesOrders.filter(o => o.status === 'refund' || o.status === 'partial_refund').length;

    // Revenue last 14 days
    const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
      const day = subDays(new Date(), 13 - i);
      const label = format(day, 'MMM d');
      const dayOrders = salesOrders.filter(o => o.time?.includes(label) && o.status !== 'refund');
      return { day: format(day, 'd'), revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length };
    });

    // Payment method breakdown
    const paymentMap: Record<string, number> = {};
    salesOrders.forEach(o => {
      const method = o.payment?.toLowerCase() || 'other';
      paymentMap[method] = (paymentMap[method] || 0) + o.total;
    });
    const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));

    // Top products
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    salesOrders.forEach(o => {
      o.items.forEach(item => {
        const key = String(item.id);
        if (!productSales[key]) productSales[key] = { name: item.name, qty: 0, revenue: 0 };
        productSales[key].qty += item.qty;
        productSales[key].revenue += item.price * item.qty;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return { totalRevenue, totalItems, avgOrderValue, refundedOrders, dailyRevenue, paymentData, topProducts };
  }, [salesOrders, products]);

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Time'],
      ...salesOrders.map(o => [o.id, o.customer, o.items.reduce((s, i) => s + i.qty, 0), o.total, o.payment, o.status, o.time]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gwe-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported as CSV');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#0A0C14] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
          <div className="text-[11px] text-white/50 font-mono mb-1">{label}</div>
          <div className="text-white font-bold">GHS {payload[0].value.toLocaleString()}</div>
          {payload[1] && <div className="text-[#2ECC71] text-[11px]">{payload[1].value} orders</div>}
        </div>
      );
    }
    return null;
  };

  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center text-[#8A90A8]">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F2F7] flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
          <div className="font-bold text-[#4A5270] mb-1">Access Restricted</div>
          <div className="text-sm">Reports are only available to the business owner.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0A0C14]">Business Reports</h2>
          <p className="text-[13px] text-[#8A90A8] mt-0.5">All-time performance overview</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-[#E2E6EF] text-[#4A5270] px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#F7F8FA] transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `GHS ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#C9A84C' },
          { label: 'Total Orders', value: salesOrders.length, icon: ShoppingCart, color: '#2ECC71' },
          { label: 'Items Sold', value: stats.totalItems, icon: Package, color: '#3498DB' },
          { label: 'Avg Order Value', value: `GHS ${Math.round(stats.avgOrderValue).toLocaleString()}`, icon: CreditCard, color: '#9B59B6' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[#E2E6EF] rounded-2xl p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider">{card.label}</div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0A0C14] font-serif">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
        <div className="p-5 px-6 border-b border-[#E2E6EF]">
          <h3 className="text-[15px] font-bold text-[#0A0C14]">Daily Revenue — Last 14 Days</h3>
        </div>
        <div className="p-5 px-6 pb-6">
          {stats.totalRevenue === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#8A90A8] flex-col gap-2">
              <TrendingUp className="w-10 h-10 opacity-20" />
              <span className="text-sm">Make some sales to see your revenue chart!</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dailyRevenue} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8A90A8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8A90A8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={44} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#C9A84C08' }} />
                <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Breakdown */}
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-5 px-6 border-b border-[#E2E6EF]">
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Revenue by Payment Method</h3>
          </div>
          <div className="p-6">
            {stats.paymentData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[#8A90A8] text-sm">No payment data yet.</div>
            ) : (
              <div className="flex gap-6 items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats.paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {stats.paymentData.map((entry, i) => (
                        <Cell key={i} fill={(PAYMENT_COLORS as any)[entry.name] || '#8A90A8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `GHS ${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2.5 shrink-0">
                  {stats.paymentData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: (PAYMENT_COLORS as any)[d.name] || '#8A90A8' }} />
                      <span className="text-[12px] text-[#4A5270] font-semibold capitalize">{d.name}</span>
                      <span className="text-[12px] text-[#8A90A8] ml-auto font-mono">GHS {d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-5 px-6 border-b border-[#E2E6EF]">
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Top Selling Products</h3>
          </div>
          <div className="p-4 px-5 flex flex-col gap-3">
            {stats.topProducts.length === 0 ? (
              <div className="py-10 text-center text-[#8A90A8] text-sm">No sales recorded yet.</div>
            ) : stats.topProducts.map((p, i) => {
              const maxRevenue = stats.topProducts[0]?.revenue || 1;
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#C9A84C] font-mono w-5">#{i + 1}</span>
                      <span className="text-[13px] font-semibold text-[#0A0C14] truncate max-w-[160px]">{p.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[13px] font-bold text-[#0A0C14]">GHS {p.revenue.toLocaleString()}</span>
                      <span className="text-[10px] text-[#8A90A8]">{p.qty} units</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#F0F2F7] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8C76A] rounded-full transition-all" style={{ width: `${(p.revenue / maxRevenue) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Refunds Summary */}
      {stats.refundedOrders > 0 && (
        <div className="bg-[#E63946]/5 border border-[#E63946]/15 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">↩</div>
            <div>
              <div className="text-[14px] font-bold text-[#E63946]">{stats.refundedOrders} Refunded Orders</div>
              <div className="text-[12px] text-[#E63946]/70 mt-0.5">Review in the Orders tab for details.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
