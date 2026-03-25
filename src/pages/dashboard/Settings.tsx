import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-3xl flex flex-col gap-6 flex-1 min-h-0">
      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
        <div className="p-5 px-6 border-b border-[#E2E6EF]">
          <h3 className="text-[15px] font-bold text-[#0A0C14]">Store Information</h3>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Store Name</label>
            <input type="text" defaultValue="God's Way Enterprise" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Address</label>
            <input type="text" defaultValue="Behind UBA Bank, Abossey Okai, Accra, Ghana" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Phone</label>
              <input type="text" defaultValue="+233 24 755 9344" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">WhatsApp Number</label>
              <input type="text" defaultValue="+233 24 755 9344" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Currency</label>
            <select className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all appearance-none">
              <option>GHS — Ghana Cedi</option>
              <option>USD — US Dollar</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Receipt Footer Message</label>
            <textarea rows={2} defaultValue="Thank you for choosing God's Way Enterprise! Come back soon 🙏" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all resize-none" />
          </div>
          <div className="pt-2">
            <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-6 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
        <div className="p-5 px-6 border-b border-[#E2E6EF]">
          <h3 className="text-[15px] font-bold text-[#0A0C14]">AI & Integrations</h3>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Google Gemini API Key</label>
            <input type="password" defaultValue="••••••••••••••••••••" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">WhatsApp Business Phone ID</label>
            <input type="text" placeholder="Enter WhatsApp Business API Phone ID" className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4A5270] uppercase tracking-wide mb-1.5 block">Paystack Public Key</label>
            <input type="password" placeholder="pk_live_..." className="w-full bg-white border border-[#E2E6EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0A0C14] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 transition-all" />
          </div>
          <div className="pt-2">
            <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-6 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
              <Save className="w-4 h-4" /> Save API Keys
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
        <div className="p-5 px-6 border-b border-[#E2E6EF]">
          <h3 className="text-[15px] font-bold text-[#0A0C14]">Database Status</h3>
        </div>
        <div className="p-6 flex flex-col gap-3">
          {[
            {name:'Supabase Database',status:'Connected',icon:CheckCircle2,color:'text-[#2ECC71]',detail:'PostgreSQL 15 · SSL Enabled'},
            {name:'Supabase Auth',status:'Active',icon:CheckCircle2,color:'text-[#2ECC71]',detail:'JWT + Row Level Security'},
            {name:'Supabase Storage',status:'Active',icon:CheckCircle2,color:'text-[#2ECC71]',detail:'Product images · CDN enabled'},
            {name:'Supabase Realtime',status:'Active',icon:CheckCircle2,color:'text-[#2ECC71]',detail:'Live inventory updates'},
            {name:'Google Gemini AI',status:'Configure API Key',icon:AlertCircle,color:'text-[#F39C12]',detail:'AI chatbot & assistant'},
            {name:'WhatsApp Business',status:'Configure',icon:AlertCircle,color:'text-[#F39C12]',detail:'Receipt & notifications'},
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-[#F7F8FA] rounded-xl border border-[#E2E6EF]">
              <div>
                <div className="text-[14px] font-semibold text-[#0A0C14]">{s.name}</div>
                <div className="text-[12px] text-[#8A90A8]">{s.detail}</div>
              </div>
              <div className={`flex items-center gap-1.5 text-[12px] font-bold ${s.color}`}>
                <s.icon className="w-4 h-4" /> {s.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
