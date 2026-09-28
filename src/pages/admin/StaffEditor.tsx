import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';

const colorPresets = [
  { name: 'Red', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', circle: 'bg-red-500' },
  { name: 'Orange', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', circle: 'bg-orange-500' },
  { name: 'Amber', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', circle: 'bg-amber-500' },
  { name: 'Green', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', circle: 'bg-green-500' },
  { name: 'Emerald', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', circle: 'bg-emerald-500' },
  { name: 'Cyan', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', circle: 'bg-cyan-500' },
  { name: 'Blue', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', circle: 'bg-blue-500' },
  { name: 'Indigo', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', circle: 'bg-indigo-500' },
  { name: 'Purple', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', circle: 'bg-purple-500' },
  { name: 'Fuchsia', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', circle: 'bg-fuchsia-500' },
  { name: 'Pink', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', circle: 'bg-pink-500' },
  { name: 'Rose', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', circle: 'bg-rose-500' },
];

export function StaffEditor() {
  const { data } = useData();
  const [staffList, setStaffList] = useState(data.staff || []);
  const [saving, setSaving] = useState(false);
  const { setTitle, setAction } = useAdminHeader();
  const { toast } = useToast();

  useEffect(() => {
    if (data.staff) {
      setStaffList(data.staff);
    }
  }, [data.staff]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'siteData/staff'), staffList);
      toast('Staff saved successfully!', 'success');
    } catch (error: any) {
      toast('Error saving: ' + error.message, 'error');
    }
    setSaving(false);
  };

  useEffect(() => {
    setTitle('Edit Staff');
    setAction(
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
      >
        <Save size={18} />
        {saving ? 'Saving...' : 'Save'}
      </button>
    );
    return () => setAction(null);
  }, [saving, staffList, setTitle, setAction]);

  const addStaff = () => {
    const newStaff = {
      id: Date.now().toString(),
      name: 'New Staff',
      username: 'Steve',
      role: 'Helper',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    };
    setStaffList([...staffList, newStaff]);
    toast('Staff member added.', 'info');
  };

  const removeStaff = (id: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
    toast('Staff member removed.', 'info');
  };

  const updateStaff = (id: string, field: string, value: string) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...staffList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setStaffList(newList);
    toast('Moved staff member up.', 'info');
  };

  const moveDown = (index: number) => {
    if (index === staffList.length - 1) return;
    const newList = [...staffList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setStaffList(newList);
    toast('Moved staff member down.', 'info');
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {staffList.map((staff, index) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 rounded-2xl border border-slate-800 relative group"
            >
              {/* Card actions: Up, Down, Delete */}
              <div className="absolute top-4 right-4 flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === staffList.length - 1}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeStaff(staff.id)}
                  className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Remove Staff"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border-2 ${staff.border || 'border-slate-700'} flex-shrink-0 p-1`}>
                  <img
                    src={`https://mc-heads.net/avatar/${staff.username || 'Steve'}`}
                    alt={staff.username}
                    className="w-full h-full object-cover pixelated"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{staff.name || 'Unnamed'}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${staff.bg || 'bg-indigo-500/10'} border ${staff.border || 'border-indigo-500/20'}`} />
                    {staff.username || 'Steve'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1 uppercase tracking-wider font-bold">Display Name</label>
                  <input
                    type="text"
                    value={staff.name}
                    onChange={(e) => updateStaff(staff.id, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 uppercase tracking-wider font-bold">Minecraft Username</label>
                  <input
                    type="text"
                    value={staff.username}
                    onChange={(e) => updateStaff(staff.id, 'username', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 uppercase tracking-wider font-bold">Role</label>
                  <input
                    type="text"
                    value={staff.role}
                    onChange={(e) => updateStaff(staff.id, 'role', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2 uppercase tracking-wider font-bold">Theme Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorPresets.map((preset) => {
                      const isSelected = staff.color === preset.color;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setStaffList(staffList.map(s => s.id === staff.id ? { 
                              ...s, 
                              color: preset.color, 
                              bg: preset.bg, 
                              border: preset.border 
                            } : s));
                          }}
                          className={`h-7 rounded-lg ${preset.bg} ${preset.color} border ${preset.border} text-[10px] font-bold uppercase transition-all flex items-center justify-center ${
                            isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105 font-extrabold' : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          title={preset.name}
                        >
                          {preset.name.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addStaff}
          className="glass-card rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center min-h-[300px] text-slate-400 hover:text-indigo-400 group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-4 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold">Add Staff Member</span>
        </motion.button>
      </div>
    </div>
  );
}
