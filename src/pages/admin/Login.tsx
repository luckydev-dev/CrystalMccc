import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let loginEmail = identifier;

      // If the identifier doesn't look like an email, assume it's a username
      if (!identifier.includes('@')) {
        const usernameQuery = query(ref(db, 'users'), orderByChild('username'), equalTo(identifier));
        const snapshot = await get(usernameQuery);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          const uid = Object.keys(userData)[0];
          loginEmail = userData[uid].email;
        } else {
          throw new Error('Username not found');
        }
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast('Logged in successfully!', 'success');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
      toast('Login failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -z-10"></div>
      
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-800/60 shadow-2xl shadow-cyan-500/5 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-[61px] w-[61px] items-center justify-center rounded-2xl overflow-hidden mb-4">
            <img 
              src="https://i.ibb.co/FLT58CqD/CM.png" 
              alt="CrystalMC Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-bold text-white font-heading tracking-tight">Admin Login</h2>
          <p className="text-slate-400 text-sm mt-2">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Email / Username</label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              placeholder="admin@crystalmc.fun"
              required
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500/80 hover:from-purple-500 hover:to-pink-400/80 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 mt-2"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            &larr; Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
