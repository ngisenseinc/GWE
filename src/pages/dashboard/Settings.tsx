import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useRBAC } from '../../context/RBACContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, User, Lock, Building2, Bell, Shield, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { uploadImageToStorage } from '../../services/storageService';
// Use backend API for avatar uploads (Cloudinary-backed) and profile updates
import { Camera } from 'lucide-react';

type Tab = 'profile' | 'security' | 'business' | 'notifications';

const NotificationToggle = ({ item }: { item: any }) => {
  const [on, setOn] = useState(item.defaultOn);
  return (
    <div className="flex items-center justify-between p-5">
      <div>
        <div className="text-[14px] font-semibold text-[#0A0C14]">{item.label}</div>
        <div className="text-[12px] text-[#8A90A8] mt-0.5">{item.desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", on ? "bg-[#C9A84C]" : "bg-[#E2E6EF]")}
      >
        <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all", on ? "left-[26px]" : "left-0.5")} />
      </button>
    </div>
  );
};

export default function Settings() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const { isOwner } = useRBAC();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Business state (owner only)
  const [businessName, setBusinessName] = useState("God's Way Enterprise");
  const [businessAddress, setBusinessAddress] = useState('Behind UBA Bank, Abossey Okai, Accra');
  const [businessPhone, setBusinessPhone] = useState('+233 24 755 9344');
  const [businessEmail, setBusinessEmail] = useState('godsway@godsway.com');

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ display_name: displayName, phone })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to update profile');
      }
      const updated = await res.json();
      setUser({ ...user, name: updated.display_name || displayName, phone: updated.phone || phone });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const imageUrl = await uploadImageToStorage(file);
        const { error } = await supabase
          .from('users')
          .update({ avatar_url: imageUrl })
          .eq('id', user?.id);

        if (error) throw error;

        setUser({ ...user, avatar_url: imageUrl, avatar: imageUrl });
        toast.success('Avatar updated!');
      } catch (err: any) {
        toast.error('Failed to upload avatar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setNewPassword(''); setConfirmPassword(''); setCurrentPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    ...(isOwner ? [{ id: 'business' as Tab, label: 'Business', icon: Building2 }] : []),
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  const FieldGroup = ({ label, children }: any) => (
    <div>
      <label className="block text-[12px] font-bold text-[#4A5270] uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );

  const TextInput = (props: any) => (
    <input {...props} className="w-full bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl px-4 py-3 text-[14px] text-[#0A0C14] focus:outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 transition-all placeholder:text-[#8A90A8]" />
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-[#EEF0F5] p-1 rounded-2xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                activeTab === tab.id
                  ? "bg-white text-[#0A0C14] shadow-sm"
                  : "text-[#8A90A8] hover:text-[#4A5270]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E2E6EF]">
            <h3 className="text-[16px] font-bold text-[#0A0C14]">Profile Information</h3>
            <p className="text-[13px] text-[#8A90A8] mt-0.5">Update your display name and contact details</p>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8C76A] flex items-center justify-center text-3xl font-black text-black shadow-[0_8px_24px_rgba(201,168,76,0.2)] overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    (displayName || user?.email || 'S').charAt(0).toUpperCase()
                  )}
                  {loading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-white border border-[#E2E6EF] shadow-lg flex items-center justify-center text-[#4A5270] hover:text-[#C9A84C] cursor-pointer transition-all hover:scale-110">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
                </label>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#0A0C14]">{user?.email}</div>
                <div className="text-[12px] text-[#C9A84C] font-mono uppercase tracking-wider mt-0.5">{user?.role || 'Employee'}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Shield className="w-3.5 h-3.5 text-[#2ECC71]" />
                  <span className="text-[11px] text-[#2ECC71] font-semibold">Verified Account</span>
                </div>
              </div>
            </div>

            <FieldGroup label="Display Name">
              <TextInput
                type="text"
                value={displayName}
                onChange={(e: any) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </FieldGroup>

            <FieldGroup label="Phone Number">
              <TextInput
                type="tel"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                placeholder="+233 XX XXX XXXX"
              />
            </FieldGroup>

            <FieldGroup label="Email Address">
              <TextInput type="email" value={user?.email || ''} disabled className="opacity-50 cursor-not-allowed" />
              <p className="text-[11px] text-[#8A90A8] mt-1.5">Email cannot be changed from here. Contact your admin.</p>
            </FieldGroup>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="self-start flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E8C76A] text-black px-6 py-3 rounded-xl text-[14px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,168,76,0.25)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E2E6EF]">
            <h3 className="text-[16px] font-bold text-[#0A0C14]">Change Password</h3>
            <p className="text-[13px] text-[#8A90A8] mt-0.5">Keep your account secure with a strong password</p>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {[
              { label: 'New Password', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
              { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(f => (
              <FieldGroup key={f.label} label={f.label}>
                <div className="relative">
                  <input
                    type={f.show ? 'text' : 'password'}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl px-4 py-3 pr-11 text-[14px] text-[#0A0C14] focus:outline-none focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/5 transition-all"
                  />
                  <button type="button" onClick={f.toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A90A8] hover:text-[#4A5270]">
                    {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FieldGroup>
            ))}

            <div className="bg-[#F7F8FA] border border-[#E2E6EF] rounded-xl p-4 text-[12px] text-[#8A90A8]">
              <div className="font-bold text-[#4A5270] mb-1.5">Password Requirements:</div>
              <ul className="space-y-1">
                <li className={cn(newPassword.length >= 6 ? "text-[#2ECC71]" : "")}>• At least 6 characters</li>
                <li className={cn(/[A-Z]/.test(newPassword) ? "text-[#2ECC71]" : "")}>• At least one uppercase letter</li>
                <li className={cn(newPassword === confirmPassword && newPassword ? "text-[#2ECC71]" : "")}>• Passwords match</li>
              </ul>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="self-start flex items-center gap-2 bg-[#0A0C14] hover:bg-[#1a1c24] text-white px-6 py-3 rounded-xl text-[14px] font-bold transition-all disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Business Tab (Owner only) */}
      {activeTab === 'business' && isOwner && (
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E2E6EF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">🏪</div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0A0C14]">Business Information</h3>
              <p className="text-[13px] text-[#8A90A8]">Used on receipts and public pages</p>
            </div>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {[
              { label: 'Business Name', value: businessName, set: setBusinessName },
              { label: 'Address', value: businessAddress, set: setBusinessAddress },
              { label: 'Business Phone', value: businessPhone, set: setBusinessPhone },
              { label: 'Business Email', value: businessEmail, set: setBusinessEmail },
            ].map(f => (
              <FieldGroup key={f.label} label={f.label}>
                <TextInput value={f.value} onChange={(e: any) => f.set(e.target.value)} />
              </FieldGroup>
            ))}
            <button
              onClick={() => toast.success('Business info saved!')}
              className="self-start flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E8C76A] text-black px-6 py-3 rounded-xl text-[14px] font-bold transition-all hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" /> Save Business Info
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-[#E2E6EF] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E2E6EF]">
            <h3 className="text-[16px] font-bold text-[#0A0C14]">Alert Preferences</h3>
            <p className="text-[13px] text-[#8A90A8] mt-0.5">Control which alerts appear in your dashboard</p>
          </div>
          <div className="divide-y divide-[#F0F2F7]">
            {[
              { label: 'Low Stock Alerts', desc: 'Notify when products drop below 5 units', defaultOn: true },
              { label: 'New Sales Alerts', desc: 'Show notifications for each completed sale', defaultOn: true },
              { label: 'Order Updates', desc: 'Alerts for purchase order status changes', defaultOn: true },
              { label: 'Daily Revenue Summary', desc: 'End-of-day summary notification', defaultOn: false },
            ].map((item, i) => (
              <NotificationToggle key={i} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone (Owner only) */}
      {isOwner && (
        <div className="bg-[#E63946]/5 border border-[#E63946]/20 rounded-2xl p-6">
          <h4 className="text-[14px] font-bold text-[#E63946] mb-1">Danger Zone</h4>
          <p className="text-[12px] text-[#E63946]/70 mb-4">Irreversible actions. Proceed with caution.</p>
          <button className="flex items-center gap-2 bg-[#E63946]/10 hover:bg-[#E63946]/20 border border-[#E63946]/25 text-[#E63946] px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors">
            Export All Data
          </button>
        </div>
      )}
    </div>
  );
}
