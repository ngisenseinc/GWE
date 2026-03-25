import { Plus, MessageSquare } from 'lucide-react';

const CUSTOMERS = [
  {name:'Kwesi Agyemang',phone:'+233 24 XXX XXXX',car:'Toyota Corolla 2012',purchases:14,total:'GHS 18,240',last:'Today'},
  {name:'Mechanics Workshop #4',phone:'+233 55 XXX XXXX',car:'Multiple',purchases:42,total:'GHS 87,500',last:'Today'},
  {name:'Ama Osei',phone:'+233 27 XXX XXXX',car:'Honda Civic 2015',purchases:7,total:'GHS 9,820',last:'Today'},
  {name:'Yaw Boateng',phone:'+233 20 XXX XXXX',car:'Nissan Sentra 2016',purchases:3,total:'GHS 2,100',last:'Yesterday'},
  {name:'Auto Garage Central',phone:'+233 26 XXX XXXX',car:'Multiple',purchases:28,total:'GHS 54,300',last:'Mar 15'},
];

export default function Customers() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex justify-end mb-5">
        <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden flex-1 flex flex-col">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F7F8FA] border-b border-[#E2E6EF] z-10">
              <tr>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Customer</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Phone / WhatsApp</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Car</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Purchases</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Total Spent</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider">Last Visit</th>
                <th className="p-3 px-4 text-[11px] font-semibold text-[#8A90A8] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c, i) => (
                <tr key={i} className="border-b border-[#E2E6EF] last:border-0 hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-3.5 px-4 font-semibold text-[#0A0C14]">{c.name}</td>
                  <td className="p-3.5 px-4"><span className="font-mono text-[12px] text-[#4A5270]">{c.phone}</span></td>
                  <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{c.car}</td>
                  <td className="p-3.5 px-4 font-medium text-[#0A0C14]">{c.purchases}</td>
                  <td className="p-3.5 px-4 font-bold text-[#C9A84C]">{c.total}</td>
                  <td className="p-3.5 px-4 text-[12px] text-[#8A90A8]">{c.last}</td>
                  <td className="p-3.5 px-4 text-right">
                    <a href={`https://wa.me/${c.phone.replace(/\s/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(37,211,102,0.2)]">
                      <MessageSquare className="w-3.5 h-3.5" /> WA
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#F7F8FA]">
          {CUSTOMERS.map((c, i) => (
            <div key={i} className="bg-white border border-[#E2E6EF] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center font-bold text-[14px] shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#0A0C14] leading-snug">{c.name}</div>
                    <div className="text-[12px] text-[#8A90A8] truncate">{c.car}</div>
                  </div>
                </div>
                <a href={`https://wa.me/${c.phone.replace(/\s/g,'')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-md bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Total Spent</span>
                  <span className="text-[14px] font-bold text-[#C9A84C]">{c.total}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A90A8] uppercase tracking-wider">Purchases</span>
                  <span className="text-[14px] font-bold text-[#0A0C14]">{c.purchases}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E6EF]">
                <div className="text-[12px] font-mono text-[#4A5270]">{c.phone}</div>
                <div className="text-[12px] text-[#8A90A8]">
                  Last: {c.last}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
