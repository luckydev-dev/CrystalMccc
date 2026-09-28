import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, get, query, orderByChild, equalTo } from 'firebase/database';
import { useToast } from '../../context/ToastContext';
import { PlayerAvatar } from '../common/PlayerAvatar';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); // username or email for login
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen]);

  // Reset errors when changing tab or opening/closing modal
  React.useEffect(() => {
    setError(null);
  }, [isLogin, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        let loginEmail = identifier.trim();
        if (!loginEmail.includes('@')) {
          try {
            const usernameQuery = query(ref(db, 'users'), orderByChild('username'), equalTo(loginEmail));
            const snapshot = await get(usernameQuery);
            if (snapshot.exists()) {
              const userData = snapshot.val();
              const uid = Object.keys(userData)[0];
              loginEmail = userData[uid].email;
            } else {
              throw new Error('Username not found. Please log in using your email address.');
            }
          } catch (lookupErr: any) {
            if (lookupErr.message && lookupErr.message.includes('Username not found')) {
              throw lookupErr;
            }
            // If database lookup is blocked due to unauthenticated rules:
            throw new Error('Please enter your account email address to log in (e.g. name@example.com).');
          }
        }
        await signInWithEmailAndPassword(auth, loginEmail, password);
        toast('Logged in successfully!', 'success');
        closeAuthModal();
      } else {
        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        if (!cleanUsername) {
          throw new Error('Please enter a valid Minecraft username.');
        }

        // Check if username already exists if readable
        let usernameTaken = false;
        try {
          const usernameQuery = query(ref(db, 'users'), orderByChild('username'), equalTo(cleanUsername));
          const snapshot = await get(usernameQuery);
          if (snapshot.exists()) {
            usernameTaken = true;
          }
        } catch (e: any) {
          console.warn('Username availability check warning:', e);
        }

        if (usernameTaken) {
          throw new Error('Username already taken. Please choose a different username.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        
        try {
          await updateProfile(userCredential.user, {
            displayName: cleanUsername
          });
        } catch (profileErr) {
          console.warn('Could not update Firebase Auth profile:', profileErr);
        }

        try {
          await set(ref(db, `users/${userCredential.user.uid}`), {
            uid: userCredential.user.uid,
            username: cleanUsername,
            email: cleanEmail,
            role: 'user',
            createdAt: Date.now()
          });
        } catch (dbErr: any) {
          console.warn('Error saving user profile data:', dbErr);
        }

        toast('Account created successfully!', 'success');
        closeAuthModal();
      }
    } catch (err: any) {
      console.error('[Auth Error]', err);
      let userFriendlyMessage = err.message || 'An error occurred. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        userFriendlyMessage = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        userFriendlyMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        userFriendlyMessage = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        userFriendlyMessage = 'Invalid email/username or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        userFriendlyMessage = 'Too many attempts. Please wait a few moments and try again.';
      } else if (err.code === 'auth/operation-not-allowed') {
        userFriendlyMessage = 'Email/Password sign-in is disabled. Please enable it in the Firebase Console.';
      } else if (userFriendlyMessage.includes('PERMISSION_DENIED') || userFriendlyMessage.includes('Permission denied')) {
        userFriendlyMessage = isLogin 
          ? 'To sign in, please enter your registered email address.'
          : 'Database permission issue. Please ensure your Firebase Realtime Database rules allow user profiles.';
      }

      setError(userFriendlyMessage);
      toast(userFriendlyMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-xl overflow-hidden">
                  <img 
                    src="https://i.ibb.co/FLT58CqD/CM.png" 
                    alt="CrystalMC Logo" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white font-heading">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>
              <button onClick={closeAuthModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Minecraft Username</label>
                    <div className="relative flex items-center">
                      <UserIcon className="absolute left-3 text-slate-500" size={18} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="Notch"
                      />
                      {username && (
                        <div className="absolute right-2 w-8 h-8 rounded-md bg-slate-800 overflow-hidden border border-slate-700">
                          <PlayerAvatar 
                            username={username} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isLogin ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Username or Email</label>
                    <div className="relative flex items-center">
                      <UserIcon className="absolute left-3 text-slate-500" size={18} />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Username or email@example.com"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 text-slate-500" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 text-slate-500" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500/80 hover:from-purple-500 hover:to-pink-400/80 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
