import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getCustomers } from '../../api/data';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, X, User, Phone, Car, DollarSign, Calendar } from 'lucide-react';

export default function Customers() {
  const customers = useStore(state => state.customers);
  const setCustomers = useStore(state => state.setCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    car: '',
    purchases: 0,
    total: 'GHS 0',
    last: 'New'
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('customers').insert([newCustomer]);
      if (error) throw error;
      toast.success('Customer added successfully');
      setIsModalOpen(false);
      setNewCustomer({ name: '', phone: '', car: '', purchases: 0, total: 'GHS 0', last: 'New' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load customers via API on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getCustomers();
        setCustomers(data as any);
      } catch (e) {
        console.error('Failed to load customers via API', e);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex justify-end mb-5">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden flex-1 flex flex-col">
        {customers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] flex items-center justify-center text-[#8A90A8] mb-4">
              <User className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0C14] mb-1">No customers yet</h3>
            <p className="text-[13px] text-[#8A90A8] max-w-[240px]">Registered customers will appear here once they make a purchase or you add them manually.</p>
          </div>
        ) : (
          <>
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
                  {customers.map((c, i) => (
                    <tr key={i} className="border-b border-[#E2E6EF] last:border-0 hover:bg-[#F7F8FA] transition-colors">
                      <td className="p-3.5 px-4 font-semibold text-[#0A0C14]">{c.name}</td>
                      <td className="p-3.5 px-4"><span className="font-mono text-[12px] text-[#4A5270]">{c.phone}</span></td>
                      <td className="p-3.5 px-4 text-[13px] text-[#4A5270]">{c.car}</td>
                      <td className="p-3.5 px-4 font-medium text-[#0A0C14]">{c.purchases}</td>
                      <td className="p-3.5 px-4 font-bold text-[#C9A84C]">{c.total}</td>
                      <td className="p-3.5 px-4 text-[12px] text-[#8A90A8]">{c.last}</td>
                      <td className="p-3.5 px-4 text-right">
                        <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(37,211,102,0.2)]">
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
              {customers.map((c, i) => (
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
                    <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-md bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors shrink-0">
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
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 px-6 border-b border-[#E2E6EF] flex items-center justify-between bg-[#F7F8FA]">
                <h3 className="text-lg font-bold text-[#0A0C14]">Add New Customer</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#8A90A8] hover:text-[#E63946] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <input 
                        required
                        type="text" 
                        value={newCustomer.name}
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="e.g. Kwesi Agyemang"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <input 
                        required
                        type="text" 
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="+233..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Vehicle Details</label>
                    <div className="relative">
                      <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <input 
                        type="text" 
                        value={newCustomer.car}
                        onChange={e => setNewCustomer({...newCustomer, car: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="e.g. Toyota Corolla 2012"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#C9A84C] text-black py-3 rounded-xl text-[14px] font-bold hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Adding...' : 'Save Customer'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
