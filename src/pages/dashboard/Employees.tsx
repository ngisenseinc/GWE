import { useState, useEffect } from 'react';
import { Plus, BarChart2, Edit } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(usersList);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) {
    return <div className="p-6 text-white/50">Loading employees...</div>;
  }

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="flex justify-end mb-2">
        <button className="bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_4px_12px_rgba(201,168,76,0.2)]">
          <Plus className="w-4 h-4" /> Invite Staff
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {employees.map(e => (
          <div key={e.id} className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 lg:w-1/3">
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border-2 border-[#C9A84C]/30 flex items-center justify-center text-[22px] shrink-0">
                  {e.role==='owner'?'👑':'💼'}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0A0C14] mb-1">{e.displayName || e.email}</h3>
                  <div className="text-[12px] font-mono font-semibold text-[#C9A84C] uppercase tracking-wide">{e.role}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 lg:gap-10 lg:w-1/2">
                <div>
                  <div className="text-[11px] text-[#8A90A8] uppercase tracking-wide mb-1">Email</div>
                  <div className="text-[13px] font-medium text-[#0A0C14]">{e.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:w-auto shrink-0">
                <span className="bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" /> Active
                </span>
                <button className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#4A5270] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
