import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Building2, Phone, FileText, MessageSquare, X, Globe, DollarSign, Star, Clock } from 'lucide-react';

export default function Suppliers() {
  const suppliers = useStore(state => state.suppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    phone: '',
    country: 'Ghana 🇬🇭',
    rating: '⭐⭐⭐⭐⭐',
    terms: 'Net 30',
    spend: 'GHS 0'
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('suppliers').insert([newSupplier]);
      if (error) throw error;
      toast.success('Supplier added successfully');
      setIsModalOpen(false);
      setNewSupplier({ name: '', contact: '', phone: '', country: 'Ghana 🇬🇭', rating: '⭐⭐⭐⭐⭐', terms: 'Net 30', spend: 'GHS 0' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {suppliers.length === 0 ? (
          <div className="bg-white border border-[#E2E6EF] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] flex items-center justify-center text-[#8A90A8] mb-4">
              <Building2 className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0C14] mb-1">No suppliers yet</h3>
            <p className="text-[13px] text-[#8A90A8] max-w-[240px]">Add your first international or local supplier to start managing POs.</p>
          </div>
        ) : suppliers.map(s => (
          <div key={s.id} className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 lg:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] shrink-0 font-bold">
                  {s.name.charAt(0)}
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
                <a href={`https://wa.me/${s.phone.replace(/\D/g,'')}?text=Hello ${encodeURIComponent(s.name)}, we would like to place an order.`} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,211,102,0.2)]">
                  <MessageSquare className="w-3.5 h-3.5" /> WA
                </a>
              </div>
            </div>
          </div>
        ))}
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
                <h3 className="text-lg font-bold text-[#0A0C14]">Add New Supplier</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#8A90A8] hover:text-[#E63946] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <input 
                        required
                        type="text" 
                        value={newSupplier.name}
                        onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="e.g. Denso Auto Parts"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Contact Person</label>
                    <input 
                      type="text" 
                      value={newSupplier.contact}
                      onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="e.g. Mr. Chen"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Phone (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <input 
                        required
                        type="text" 
                        value={newSupplier.phone}
                        onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="+233..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Country</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <input 
                        type="text" 
                        value={newSupplier.country}
                        onChange={e => setNewSupplier({...newSupplier, country: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="Ghana 🇬🇭"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8A90A8] uppercase tracking-wider mb-1.5">Credit Terms</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A8]" />
                      <select 
                        value={newSupplier.terms}
                        onChange={e => setNewSupplier({...newSupplier, terms: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl text-[13px] outline-none focus:border-[#C9A84C] transition-colors appearance-none"
                      >
                        <option>Cash</option>
                        <option>Net 15</option>
                        <option>Net 30</option>
                        <option>Net 60</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#C9A84C] text-black py-3 rounded-xl text-[14px] font-bold hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Adding...' : 'Save Supplier'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
