import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users as UsersIcon, Shield, ShieldAlert, User, Check, X, Search, 
  ShoppingBag, Ticket, Image as ImageIcon, Star, ShieldCheck, 
  HelpCircle, Store as StoreIcon, Settings, MessageSquare, Lock, Bell, Trash2
} from 'lucide-react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface UserData {
  uid: string;
  username: string;
  email: string;
  role: string;
  permissions?: string[];
}

const PERMISSIONS = [
  { id: 'orders', label: 'Orders', icon: ShoppingBag, desc: 'Manage player purchases' },
  { id: 'promo-codes', label: 'Promo Codes', icon: Ticket, desc: 'Create and edit discounts' },
  { id: 'hero', label: 'Hero Section', icon: ImageIcon, desc: 'Update landing page content' },
  { id: 'featured', label: 'Featured Store', icon: Star, desc: 'Manage highlighted items' },
  { id: 'rules', label: 'Rules', icon: ShieldCheck, desc: 'Edit server guidelines' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Manage help documentation' },
  { id: 'store', label: 'Store', icon: StoreIcon, desc: 'Configure store categories' },
  { id: 'staff', label: 'Staff', icon: UsersIcon, desc: 'Manage team members' },
  { id: 'users', label: 'User Management', icon: Lock, desc: 'Manage roles & permissions' },
  { id: 'notifications', label: 'Push Notifications', icon: Bell, desc: 'Send OneSignal alerts' },
  { id: 'discord', label: 'Discord Webhook', icon: MessageSquare, desc: 'Configure notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, desc: 'General site configuration' }
];

export function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const { toast } = useToast();
  const { setTitle } = useAdminHeader();
  const { user, role: currentUserRole, userData } = useAuth();

  useEffect(() => {
    setTitle('User Management');

    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.entries(data).map(([uid, value]: [string, any]) => ({
          uid,
          ...value
        }));
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, [setTitle]);

  if (currentUserRole !== 'owner' && !(userData?.permissions && userData.permissions.includes('users'))) {
    return (
      <div className="p-6 text-center">
        <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You do not have permission to access user management.</p>
      </div>
    );
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Security check: Admins cannot edit Owners (though they shouldn't even be on this page)
    const targetUser = users.find(u => u.uid === editingUser.uid);
    if (targetUser?.role === 'owner' && currentUserRole !== 'owner') {
      toast('You do not have permission to edit an owner.', 'error');
      return;
    }

    // Security check: Owners cannot give owner role to anyone else
    if (editingUser.role === 'owner' && targetUser?.role !== 'owner') {
      toast('You cannot grant the owner role to other users.', 'error');
      return;
    }

    // Prevent self-demotion for owners
    if (user?.uid === editingUser.uid && targetUser?.role === 'owner' && editingUser.role !== 'owner') {
      toast('You cannot demote yourself from the owner role.', 'error');
      return;
    }

    try {
      await set(ref(db, `users/${editingUser.uid}/role`), editingUser.role);
      if (editingUser.role === 'admin') {
        await set(ref(db, `users/${editingUser.uid}/permissions`), editingUser.permissions || []);
      } else {
        await set(ref(db, `users/${editingUser.uid}/permissions`), null);
      }
      toast('User updated successfully', 'success');
      setEditingUser(null);
    } catch (error) {
      toast('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (uid: string, username: string) => {
    if (user?.uid === uid) {
      toast('You cannot delete your own account.', 'error');
      return;
    }

    const targetUser = users.find(u => u.uid === uid);
    if (targetUser?.role === 'owner' && currentUserRole !== 'owner') {
      toast('You do not have permission to delete an owner.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${username || 'Unknown'}"? This action cannot be undone.`)) {
      try {
        await remove(ref(db, `users/${uid}`));
        toast('User deleted successfully', 'success');
      } catch (error) {
        toast('Failed to delete user', 'error');
      }
    }
  };

  const togglePermission = (permId: string) => {
    if (!editingUser) return;
    const currentPerms = editingUser.permissions || [];
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter(p => p !== permId)
      : [...currentPerms, permId];
    
    setEditingUser({ ...editingUser, permissions: newPerms });
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-4 text-slate-400 font-medium text-sm">User</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Role</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Permissions</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{u.username || 'Unknown'}</div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      u.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      u.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {u.role === 'owner' && <ShieldAlert size={12} />}
                      {u.role === 'admin' && <Shield size={12} />}
                      {u.role === 'user' && <User size={12} />}
                      {(u.role || 'user').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <div className="flex flex-wrap gap-1">
                        {u.permissions?.length ? u.permissions.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded uppercase tracking-wider">
                            {p}
                          </span>
                        )) : <span className="text-slate-500 text-sm">No permissions</span>}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {/* Admins cannot edit/delete Owners */}
                    {u.role === 'owner' && currentUserRole !== 'owner' ? (
                      <span className="text-slate-600 text-sm italic">Protected</span>
                    ) : (
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={() => setEditingUser({ ...u, role: u.role || 'user', permissions: u.permissions || [] })}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          Edit Role
                        </button>
                        {u.uid !== user?.uid && (
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.username)}
                            className="text-rose-500 hover:text-rose-400 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
                    <Shield size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white font-heading tracking-tight">Access Control</h2>
                    <p className="text-slate-400 text-sm font-medium">Configuring permissions for <span className="text-cyan-400">{editingUser.username}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                {/* Role Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Account Privilege</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'user', label: 'Standard User', icon: User, desc: 'Basic store access' },
                      { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Restricted dashboard' },
                      ...(editingUser.role === 'owner' ? [{ id: 'owner', label: 'System Owner', icon: ShieldAlert, desc: 'Full root access' }] : [])
                    ].map((roleOption) => (
                      <button
                        key={roleOption.id}
                        type="button"
                        onClick={() => setEditingUser({ ...editingUser, role: roleOption.id })}
                        className={cn(
                          "flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left group",
                          editingUser.role === roleOption.id
                            ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                            : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <roleOption.icon size={20} className={cn(
                          "mb-3 transition-colors",
                          editingUser.role === roleOption.id ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"
                        )} />
                        <div className={cn(
                          "font-bold text-sm mb-1",
                          editingUser.role === roleOption.id ? "text-white" : "text-slate-300"
                        )}>{roleOption.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{roleOption.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions Grid */}
                {editingUser.role === 'admin' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          Module Access {currentUserRole !== 'owner' && '(Read Only)'}
                        </label>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        {editingUser.permissions?.length || 0} Enabled
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      {PERMISSIONS.map(perm => {
                        const isChecked = editingUser.permissions?.includes(perm.id);
                        const isOwner = currentUserRole === 'owner';
                        const Icon = perm.icon;
                        
                        return (
                          <div
                            key={perm.id}
                            onClick={() => isOwner && togglePermission(perm.id)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                              isChecked 
                                ? "bg-cyan-500/5 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.05)]" 
                                : "bg-slate-950/30 border-slate-800/50 hover:border-slate-700",
                              isOwner ? "cursor-pointer" : "cursor-default opacity-60"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0",
                              isChecked 
                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/40" 
                                : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
                            )}>
                              <Icon size={20} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-bold text-sm transition-colors",
                                isChecked ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                              )}>
                                {perm.label}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{perm.desc}</div>
                            </div>

                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300",
                              isChecked 
                                ? "bg-cyan-500 border-cyan-500" 
                                : "border-slate-700 bg-slate-900"
                            )}>
                              {isChecked && <Check size={12} className="text-white" strokeWidth={4} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="p-8 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all duration-300 active:scale-95 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 py-4 rounded-2xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-all duration-300 shadow-xl shadow-cyan-600/30 active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <Check size={20} className="group-hover:scale-110 transition-transform" />
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
