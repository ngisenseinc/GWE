import { Plus, Building2, Phone, FileText, MessageSquare } from 'lucide-react';

const SUPPLIERS = [
  {id:1,name:'Denso Auto Parts Ltd',contact:'Mr. Chen',phone:'+86 XX XXXX XXXX',country:'China 🇨🇳',rating:'⭐⭐⭐⭐⭐',terms:'Net 30',spend:'GHS 45,200'},
  {id:2,name:'Ghana Spare Parts Co.',contact:'Mr. Asiedu',phone:'+233 30 XXX XXXX',country:'Ghana 🇬🇭',rating:'⭐⭐⭐⭐',terms:'Cash',spend:'GHS 28,800'},
  {id:3,name:'AutoParts Dubai Trading',contact:'Khalid Al-Rashid',phone:'+971 XX XXX XXXX',country:'UAE 🇦🇪',rating:'⭐⭐⭐⭐⭐',terms:'Net 60',spend:'GHS 62,500'},
  {id:4,name:'Seoul Motor Parts',contact:'Kim Yong',phone:'+82 XX XXXX XXXX',country:'South Korea 🇰🇷',rating:'⭐⭐⭐⭐',terms:'Net 45',spend:'GHS 31,100'},
];

export default function Suppliers() {
  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="flex justify-end mb-2">
        <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SUPPLIERS.map(s => (
          <div key={s.id} className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 lg:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0A0C14] mb-1">{s.name}</h3>
                  <div className="text-[13px] text-[#8A90A8]">{s.contact} · {s.country}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 lg:gap-10 lg:w-1/2">
                <div>
                  <div className="text-[11px] text-[#8A90A8] uppercase tracking-wide mb-1">Phone</div>
                  <div className="text-[13px] font-medium text-[#0A0C14] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C9A84C]" /> {s.phone}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8A90A8] uppercase tracking-wide mb-1">Terms</div>
                  <div className="text-[13px] font-medium text-[#0A0C14]">{s.terms}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8A90A8] uppercase tracking-wide mb-1">Total Spend</div>
                  <div className="text-[13px] font-bold text-[#C9A84C]">{s.spend}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8A90A8] uppercase tracking-wide mb-1">Rating</div>
                  <div className="text-[13px]">{s.rating}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:w-auto shrink-0">
                <button className="bg-[#C9A84C] text-black px-4 py-2 rounded-lg text-[12px] font-bold hover:-translate-y-0.5 transition-transform flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> PO
                </button>
                <button className="bg-white border border-[#E2E6EF] text-[#4A5270] px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-[#F7F8FA] transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> History
                </button>
                <a href={`https://wa.me/?text=Hello ${encodeURIComponent(s.name)}, we would like to place an order.`} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,211,102,0.2)]">
                  <MessageSquare className="w-3.5 h-3.5" /> WA
                </a>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
