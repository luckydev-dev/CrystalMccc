import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Gavel, MessageSquare, Plus, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { useData, RuleCategory } from '../../context/DataContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';
import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase';

const ICONS = {
  Shield: Shield,
  Gavel: Gavel,
  MessageSquare: MessageSquare,
  AlertCircle: AlertCircle,
};

export function RulesEditor() {
  const { data } = useData();
  const { setTitle, setAction } = useAdminHeader();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RuleCategory | null>(null);

  useEffect(() => {
    if (data.rules && Array.isArray(data.rules)) {
      setCategories(data.rules);
    }
  }, [data.rules]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'siteData/rules'), categories);
      toast('Rules saved successfully!', 'success');
    } catch (error) {
      console.error("Error saving rules:", error);
      toast('Failed to save rules.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setTitle('Rules Configuration');
    setAction(
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          'Save'
        )}
      </button>
    );
    return () => setAction(null);
  }, [categories, isSaving, setTitle, setAction]);

  const handleAddCategory = () => {
    const newCategory: RuleCategory = {
      id: Date.now().toString(),
      title: 'New Category',
      icon: 'Shield',
      rules: ['Rule 1']
    };
    setCategories([...categories, newCategory]);
    setEditingCategory(newCategory);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleUpdateCategory = (updated: RuleCategory) => {
    setCategories(categories.map(c => c.id === updated.id ? updated : c));
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <p className="text-slate-400 mb-8">Manage server rules and categories</p>

      <div className="space-y-6">
        {categories.map((category) => {
          const IconComponent = ICONS[category.icon as keyof typeof ICONS] || Shield;
          
          return (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-slate-800/60 relative group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                  <IconComponent size={24} className="text-slate-300" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 rounded-xl bg-slate-800/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-slate-700/50"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 rounded-xl bg-slate-800/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-slate-700/50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">{category.title}</h3>
              
              <ul className="space-y-3">
                {category.rules.slice(0, 3).map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
                {category.rules.length > 3 && (
                  <li className="text-slate-500 italic text-sm pt-2">
                    +{category.rules.length - 3} more...
                  </li>
                )}
              </ul>
            </motion.div>
          );
        })}

        <motion.button
          onClick={handleAddCategory}
          className="w-full py-12 rounded-3xl border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900/30 transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={24} className="text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-slate-400 font-medium group-hover:text-white transition-colors">Add New Category</span>
        </motion.button>
      </div>

      {/* Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {editingCategory && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingCategory(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">Edit Category</h3>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={editingCategory.title}
                      onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Icon
                    </label>
                    <div className="relative">
                      <select
                        value={editingCategory.icon}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none pl-12"
                      >
                        {Object.keys(ICONS).map(iconName => (
                          <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                        {React.createElement(ICONS[editingCategory.icon as keyof typeof ICONS] || Shield, { size: 20 })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Rules (One per line)
                    </label>
                    <textarea
                      value={editingCategory.rules.join('\n')}
                      onChange={(e) => setEditingCategory({ ...editingCategory, rules: e.target.value.split('\n').filter(r => r.trim() !== '') })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-48 resize-none custom-scrollbar"
                      placeholder="Enter rules here..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="flex-1 py-3 px-4 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateCategory(editingCategory)}
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                      Update Category
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
