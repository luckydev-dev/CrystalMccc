import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useData, FAQItem } from '../../context/DataContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';
import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase';

export function FAQEditor() {
  const { data } = useData();
  const { setTitle, setAction } = useAdminHeader();
  const { toast } = useToast();
  
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data.faq && Array.isArray(data.faq)) {
      setFaqs(data.faq);
    }
  }, [data.faq]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'siteData/faq'), faqs);
      toast('FAQs saved successfully!', 'success');
    } catch (error) {
      console.error("Error saving FAQs:", error);
      toast('Failed to save FAQs.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setTitle('FAQ Management');
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
  }, [faqs, isSaving, setTitle, setAction]);

  const handleAddFaq = () => {
    const newFaq: FAQItem = {
      id: Date.now().toString(),
      question: 'New Question',
      answer: 'New Answer'
    };
    setFaqs([newFaq, ...faqs]);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newFaqs = [...faqs];
      [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
      setFaqs(newFaqs);
    } else if (direction === 'down' && index < faqs.length - 1) {
      const newFaqs = [...faqs];
      [newFaqs[index + 1], newFaqs[index]] = [newFaqs[index], newFaqs[index + 1]];
      setFaqs(newFaqs);
    }
  };

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <p className="text-slate-400 mb-8">Manage frequently asked questions.</p>

      <div className="glass-card p-6 rounded-3xl border border-slate-800/60">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">Questions & Answers</h3>
          <button
            onClick={handleAddFaq}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-400 px-4 py-2 rounded-xl font-medium transition-colors border border-slate-700/50"
          >
            <Plus size={18} />
            Add FAQ
          </button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex gap-4 group"
            >
              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === faqs.length - 1}
                  className="text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Answer</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none custom-scrollbar"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No FAQs added yet. Click "Add FAQ" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
