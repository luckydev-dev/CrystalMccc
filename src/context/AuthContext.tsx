import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';

interface UserData {
  username?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  coins?: number;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  userData: UserData | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null, 
  userData: null,
  loading: true,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    console.log("[Auth] Initializing onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("[Auth] State changed. User:", currentUser?.email || "None");
      setLoading(true);
      setUser(currentUser);
      
      if (currentUser) {
        // Set OneSignal External ID safely
        const syncOneSignalLogin = (os: any) => {
          try {
            if (os && typeof os.login === 'function') {
              os.login(currentUser.uid).catch(() => {});
            }
          } catch (_) {}
        };

        if ((window as any).OneSignal) {
          syncOneSignalLogin((window as any).OneSignal);
        } else {
          (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
          (window as any).OneSignalDeferred.push(syncOneSignalLogin);
        }

        try {
          console.log("[Auth] Fetching role for:", currentUser.uid);
          const userRef = ref(db, `users/${currentUser.uid}`);
          let snapshot = await get(userRef);
          
          let data = snapshot.exists() ? snapshot.val() : null;
          
          // Check if any owner exists in the database
          let hasOwner = false;
          let totalUserCount = 0;
          try {
            const usersRef = ref(db, 'users');
            const usersSnapshot = await get(usersRef);
            if (usersSnapshot.exists()) {
              const allUsers = usersSnapshot.val();
              hasOwner = Object.values(allUsers).some((u: any) => u && u.role === 'owner');
              totalUserCount = Object.keys(allUsers).length;
            }
          } catch (err) {
            console.warn("[Auth] Could not check users for owner:", err);
            hasOwner = true; // Assume owner exists on error to prevent accidental promotion
          }
          
          if (!hasOwner) {
            console.log("[Auth] No owner found in database. Promoting current user to owner...");
            if (data) {
              await set(ref(db, `users/${currentUser.uid}/role`), 'owner');
              data.role = 'owner';
            } else {
              // Create user record if it doesn't exist
              data = {
                uid: currentUser.uid,
                username: currentUser.email?.split('@')[0] || 'admin',
                email: currentUser.email || '',
                role: 'owner',
                createdAt: Date.now()
              };
              await set(userRef, data);
            }
          } else if (data && (!data.role || data.role === 'user') && totalUserCount === 1) {
            // If this is the only user and they are currently a 'user', promote them
            await set(ref(db, `users/${currentUser.uid}/role`), 'owner');
            data.role = 'owner';
          }
          
          if (data) {
            console.log("[Auth] Role found:", data.role);
            setUserData(data);
            setRole(data.role || null);
          } else {
            console.warn("[Auth] No user document found in RTDB");
            setUserData(null);
            setRole(null);
          }
        } catch (error) {
          console.error("[Auth] Error fetching user data:", error);
          setUserData(null);
          setRole(null);
        }
      } else {
        const syncOneSignalLogout = (os: any) => {
          try {
            if (os && typeof os.logout === 'function') {
              os.logout().catch(() => {});
            }
          } catch (_) {}
        };

        if ((window as any).OneSignal) {
          syncOneSignalLogout((window as any).OneSignal);
        } else if ((window as any).OneSignalDeferred) {
          (window as any).OneSignalDeferred.push(syncOneSignalLogout);
        }
        setUserData(null);
        setRole(null);
      }
      
      console.log("[Auth] Setting loading to false");
      setLoading(false);
    });

    // Safety timeout for auth loading
    const safetyTimeout = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.warn("[Auth] Loading safety timeout reached. Forcing loading to false.");
          return false;
        }
        return currentLoading;
      });
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, userData, loading, isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
}
