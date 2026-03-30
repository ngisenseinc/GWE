import { useState, useEffect } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Phone, Shield, ShieldCheck, Loader2, X, MoreVertical, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

type Employee = {
  id: string;
  email: string;
  display_name: string;
  role: 'owner' | 'employee';
  phone?: string;
  created_at?: string;
  last_sign_in_at?: string;
};

export default function Employees() {
  const { isOwner } = useRBAC();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'employee'>('employee');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEmployees(data || []);
    } catch (err: any) {
      toast.error('Failed to load employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      // Generate temp password
      const tempPassword = `GWE@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const { data, error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: tempPassword,
        options: { data: { display_name: inviteName || inviteEmail.split('@')[0] } },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert([{
          id: data.user.id,
          email: inviteEmail,
          display_name: inviteName || inviteEmail.split('@')[0],
          role: inviteRole,
        }]);

        if (profileError && !profileError.message?.includes('duplicate')) {
          console.warn('Profile creation error:', profileError);
        }
      }

      toast.success(`Staff account created! Temp password: ${tempPassword}`, { duration: 8000 });
      setShowInviteModal(false);
      setInviteEmail(''); setInviteName(''); setInviteRole('employee');
      fetchEmployees();
    } catch (err: any) {
      const msg = err.message?.includes('already registered')
        ? 'This email is already registered.'
        : err.message || 'Failed to create account';
      toast.error(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: 'owner' | 'employee') => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);
      if (error) throw error;
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, role: newRole } : e));
      toast.success(`Role updated to ${newRole}`);
      setOpenMenu(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const filtered = employees.filter(e =>
    e.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center text-[#8A90A8]">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F2F7] flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
          <div className="font-bold text-[#4A5270] mb-1">Access Restricted</div>
          <div className="text-sm">Employee management is only available to the business owner.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#0A0C14]">Staff Management</h2>
          <p className="text-[13px] text-[#8A90A8] mt-0.5">{employees.length} team member{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E8C76A] text-black px-5 py-3 rounded-xl text-[13px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,168,76,0.25)] self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#E2E6EF] rounded-xl px-4 py-3 focus-within:border-[#C9A84C] transition-colors">
        <Search className="w-4 h-4 text-[#8A90A8] shrink-0" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-[14px] text-[#0A0C14] placeholder:text-[#8A90A8] flex-1"
        />
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-[#C9A84C] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E2E6EF] rounded-2xl py-16 text-center text-[#8A90A8]">
          <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <div className="font-semibold text-[#4A5270] mb-1">No staff found</div>
          <div className="text-sm">Add your first team member using the button above.</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className="bg-white border border-[#E2E6EF] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                  emp.role === 'owner'
                    ? "bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] text-black shadow-[0_4px_12px_rgba(201,168,76,0.2)]"
                    : "bg-[#F0F2F7] text-[#4A5270]"
                )}>
                  {(emp.display_name || emp.email || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-[#0A0C14] truncate">{emp.display_name || 'Staff Member'}</div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[12px] text-[#8A90A8]">
                      <Mail className="w-3 h-3" /> {emp.email}
                    </span>
                    {emp.phone && (
                      <span className="flex items-center gap-1 text-[12px] text-[#8A90A8]">
                        <Phone className="w-3 h-3" /> {emp.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border",
                  emp.role === 'owner'
                    ? "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/25"
                    : "bg-[#3498DB]/10 text-[#3498DB] border-[#3498DB]/25"
                )}>
                  {emp.role === 'owner' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {emp.role === 'owner' ? 'Owner' : 'Employee'}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === emp.id ? null : emp.id)}
                    className="w-9 h-9 rounded-lg bg-[#F7F8FA] border border-[#E2E6EF] flex items-center justify-center text-[#8A90A8] hover:text-[#4A5270] hover:bg-[#EEF0F5] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === emp.id && (
                    <div className="absolute right-0 top-10 z-20 bg-white border border-[#E2E6EF] rounded-xl shadow-xl min-w-[160px] overflow-hidden">
                      {emp.role !== 'owner' && (
                        <button onClick={() => handleRoleChange(emp.id, 'owner')} className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#4A5270] hover:bg-[#F7F8FA] flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#C9A84C]" /> Make Owner
                        </button>
                      )}
                      {emp.role !== 'employee' && (
                        <button onClick={() => handleRoleChange(emp.id, 'employee')} className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#4A5270] hover:bg-[#F7F8FA] flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#3498DB]" /> Set as Employee
                        </button>
                      )}
                      <button onClick={() => setOpenMenu(null)} className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#8A90A8] hover:bg-[#F7F8FA]">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[18px] font-bold text-[#0A0C14]">Add Team Member</h3>
                <p className="text-[13px] text-[#8A90A8] mt-0.5">Create a new staff account</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-9 h-9 rounded-xl bg-[#F0F2F7] flex items-center justify-center text-[#8A90A8] hover:bg-[#E8EAEF]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Kwame Asante" className="w-full bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5">Email Address *</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="staff@godsway.com" required className="w-full bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5">Role</label>
                <div className="flex gap-3">
                  {(['employee', 'owner'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setInviteRole(r)} className={cn("flex-1 py-3 rounded-xl text-[13px] font-bold border transition-all flex items-center justify-center gap-2", inviteRole === r ? "bg-[#C9A84C] border-[#C9A84C] text-black" : "bg-[#F7F8FA] border-[#E2E6EF] text-[#4A5270] hover:border-[#C9A84C]/40")}>
                      {r === 'owner' ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl p-4 text-[12px] text-[#8A90A8]">
                💡 A temporary password will be generated and shown after account creation. Share it securely with the new staff member.
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 bg-[#F7F8FA] border border-[#E2E6EF] text-[#4A5270] py-3 rounded-xl text-[14px] font-bold hover:bg-[#EEF0F5] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading || !inviteEmail} className="flex-1 bg-[#C9A84C] hover:bg-[#E8C76A] text-black py-3 rounded-xl text-[14px] font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
