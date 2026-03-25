import { ArrowUpRight, DollarSign, TrendingUp, ShoppingCart, Package, Download } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Reports() {
  const products = useStore(state => state.products);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A84C] to-transparent" />
          <div className="text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-2">This Month Revenue</div>
          <div className="text-3xl font-bold text-[#0A0C14] mb-1.5 font-serif">GHS 98,420</div>
          <div className="text-xs flex items-center gap-1 text-[#2ECC71]"><ArrowUpRight className="w-3 h-3" /> 23% vs last month</div>
          <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-xl text-[#C9A84C]"><DollarSign className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2ECC71] to-transparent" />
          <div className="text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-2">Gross Profit</div>
          <div className="text-3xl font-bold text-[#0A0C14] mb-1.5 font-serif">GHS 41,280</div>
          <div className="text-xs flex items-center gap-1 text-[#2ECC71]"><ArrowUpRight className="w-3 h-3" /> 42% margin</div>
          <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center text-xl text-[#2ECC71]"><TrendingUp className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3498DB] to-transparent" />
          <div className="text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-2">Total Transactions</div>
          <div className="text-3xl font-bold text-[#0A0C14] mb-1.5 font-serif">847</div>
          <div className="text-xs flex items-center gap-1 text-[#2ECC71]"><ArrowUpRight className="w-3 h-3" /> 120 more</div>
          <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-[#3498DB]/10 flex items-center justify-center text-xl text-[#3498DB]"><ShoppingCart className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl p-6 relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F39C12] to-transparent" />
          <div className="text-xs font-semibold text-[#8A90A8] uppercase tracking-wide mb-2">Stock Value</div>
          <div className="text-3xl font-bold text-[#0A0C14] mb-1.5 font-serif">GHS 284K</div>
          <div className="text-xs flex items-center gap-1 text-[#8A90A8]">Across 5,000+ SKUs</div>
          <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-[#F39C12]/10 flex items-center justify-center text-xl text-[#F39C12]"><Package className="w-5 h-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-5 px-6 border-b border-[#E2E6EF]">
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Top Selling Products</h3>
          </div>
          <div className="p-6">
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 py-3 border-b border-[#E2E6EF] last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#0A0C14] truncate">{p.name}</div>
                  <div className="text-[11px] text-[#8A90A8]">{p.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#C9A84C]">GHS {(p.price * (20 - i * 3)).toLocaleString()}</div>
                  <div className="text-[11px] text-[#8A90A8]">{20 - i * 3} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-5 px-6 border-b border-[#E2E6EF]">
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Sales by Category</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {[
              {cat:'Radiators',pct:28,val:'GHS 27,540'},
              {cat:'Body Parts',pct:22,val:'GHS 21,650'},
              {cat:'AC Parts',pct:20,val:'GHS 19,680'},
              {cat:'Lighting',pct:18,val:'GHS 17,720'},
              {cat:'Fans',pct:12,val:'GHS 11,830'}
            ].map(c => (
              <div key={c.cat}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] text-[#0A0C14] font-medium">{c.cat}</span>
                  <span className="text-[12px] font-bold text-[#C9A84C]">{c.val}</span>
                </div>
                <div className="h-2 bg-[#F7F8FA] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8C76A] rounded-full transition-all duration-1000" style={{ width: `${c.pct}%` }} />
                </div>
                <div className="text-[11px] text-[#8A90A8] mt-1">{c.pct}% of revenue</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {['Daily Sales Report', 'Inventory Valuation', 'Staff Performance', 'Supplier Report', 'P&L Statement'].map(r => (
          <button key={r} className="bg-white border border-[#E2E6EF] text-[#4A5270] px-4 py-3 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8FA] hover:border-[#C9A84C] transition-colors">
            <Download className="w-4 h-4" /> {r}
          </button>
        ))}
      </div>
    </div>
  );
}
