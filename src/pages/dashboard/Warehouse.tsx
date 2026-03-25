import { useStore } from '../../store/useStore';
import { ClipboardList, Package, Printer, AlertTriangle } from 'lucide-react';

export default function Warehouse() {
  const products = useStore(state => state.products);
  const bins = ['A-1-01','A-1-02','A-2-01','A-2-02','B-1-01','B-1-02','B-2-01','C-1-01'];

  const totalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const inStock = products.filter(p => p.status === 'in').length;
  const lowStock = products.filter(p => p.status === 'low').length;
  const outOfStock = products.filter(p => p.status === 'out').length;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
            <ClipboardList className="w-4 h-4" /> Start Stock Count
          </button>
          <button className="bg-white border border-[#E2E6EF] text-[#4A5270] px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8FA] transition-colors">
            <Package className="w-4 h-4" /> Receive Delivery
          </button>
          <button className="bg-white border border-[#E2E6EF] text-[#4A5270] px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8FA] transition-colors">
            <Printer className="w-4 h-4" /> Print Labels
          </button>
        </div>

        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-5 px-6 border-b border-[#E2E6EF]">
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Bin Locations Map</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {bins.map((bin, i) => {
                const product = products[i % products.length];
                const statusColors = {
                  in: 'bg-[#2ECC71]/10 border-[#2ECC71]/30',
                  low: 'bg-[#F39C12]/10 border-[#F39C12]/30',
                  out: 'bg-[#E63946]/10 border-[#E63946]/30'
                };
                return (
                  <div key={bin} className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${statusColors[product.status]}`}>
                    <div className="font-mono text-[11px] text-[#8A90A8] mb-2">{bin}</div>
                    <div className="text-[13px] font-semibold text-[#0A0C14] mb-1.5 leading-snug line-clamp-2">{product.name}</div>
                    <div className="text-[12px] text-[#4A5270] flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center bg-white/50 shrink-0">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : product.emoji}
                      </div>
                      Qty: <strong className="text-[#0A0C14]">{product.stock}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[340px] flex flex-col gap-6 shrink-0">
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-5 px-6 border-b border-[#E2E6EF]">
            <h3 className="text-[15px] font-bold text-[#0A0C14]">Warehouse Stats</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#8A90A8]">Total SKUs</span>
              <span className="font-bold text-[#0A0C14]">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#8A90A8]">In Stock</span>
              <span className="font-bold text-[#2ECC71]">{inStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#8A90A8]">Low Stock</span>
              <span className="font-bold text-[#F39C12]">{lowStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#8A90A8]">Out of Stock</span>
              <span className="font-bold text-[#E63946]">{outOfStock}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#E2E6EF] pt-4 mt-1">
              <span className="text-[13px] text-[#8A90A8]">Total Value</span>
              <span className="font-bold text-[#C9A84C] text-lg">GHS {totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E63946]/30 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(230,57,70,0.08)]">
          <div className="p-5 px-6 border-b border-[#E63946]/20 bg-[#E63946]/5 flex items-center gap-2">
            <div className="relative flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-40"></span>
              <AlertTriangle className="relative w-4 h-4 text-[#E63946]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#E63946]">Action Required: Reorder Now</h3>
          </div>
          <div className="p-4 px-5">
            {products.filter(p => p.status === 'low' || p.status === 'out').map(p => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-[#E2E6EF] last:border-0 last:pb-0">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="text-[13px] font-semibold text-[#0A0C14] truncate">{p.name}</div>
                  <div className="text-[11px] font-medium text-[#E63946] mt-0.5">{p.stock} units left</div>
                </div>
                <button className="bg-[#E63946] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:-translate-y-0.5 transition-transform shrink-0 shadow-sm">
                  Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
