import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration for CRYSTAL MC
const firebaseConfig = {
  apiKey: "AIzaSyCEFj-7ck9Ft6Y5N5NreJtiKXhrSMuWcEA",
  authDomain: "crystal-mc.firebaseapp.com",
  databaseURL: "https://crystal-mc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crystal-mc",
  storageBucket: "crystal-mc.firebasestorage.app",
  messagingSenderId: "1011339336035",
  appId: "1:1011339336035:web:f73e5bf36e5db1c3de1b56"
};

// Initialize CRYSTAL MC as the primary application
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
