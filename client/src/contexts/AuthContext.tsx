// ============================================================
// easyhomefix — Authentication Context
// Firebase Auth with role-based access control
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AuthUser, UserRole } from '../types';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isDemoMode: boolean;
  demoLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for when Firebase is not configured
const DEMO_USERS: Record<UserRole, AuthUser> = {
  tenant: {
    uid: 'demo-tenant-001',
    email: 'tenant@demo.com',
    displayName: 'James Wilson',
    role: 'tenant',
    propertyId: 'prop-001',
    unitNumber: '2B',
  },
  property_manager: {
    uid: 'demo-manager-001',
    email: 'manager@demo.com',
    displayName: 'Alex Morgan',
    role: 'property_manager',
  },
  contractor: {
    uid: 'demo-contractor-001',
    email: 'contractor@demo.com',
    displayName: 'Mike Johnson',
    role: 'contractor',
  },
  admin: {
    uid: 'demo-admin-001',
    email: 'admin@demo.com',
    displayName: 'Admin User',
    role: 'admin',
  },
};

const isFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return !!apiKey && apiKey !== 'demo-api-key' && !apiKey.startsWith('demo-');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured();

  // Fetch user role from Firestore
  const fetchUserRole = useCallback(async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || data.displayName,
          role: data.role as UserRole,
          propertyId: data.propertyId,
          unitNumber: data.unitNumber,
        };
      }
      // Default to tenant if no role found
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'tenant',
      };
    } catch {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'tenant',
      };
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      // Check localStorage for demo session
      const savedRole = localStorage.getItem('easyhomefix_demo_role') as UserRole | null;
      if (savedRole && DEMO_USERS[savedRole]) {
        setCurrentUser(DEMO_USERS[savedRole]);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const authUser = await fetchUserRole(firebaseUser);
        setCurrentUser(authUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode, fetchUserRole]);

  const login = async (email: string, password: string): Promise<void> => {
    if (isDemoMode) {
      // Demo login by email
      const demoUser = Object.values(DEMO_USERS).find(u => u.email === email);
      if (demoUser) {
        localStorage.setItem('easyhomefix_demo_role', demoUser.role);
        setCurrentUser(demoUser);
        return;
      }
      throw new Error('Invalid demo credentials. Use one of the demo accounts.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<void> => {
    if (isDemoMode) {
      throw new Error('Registration is disabled in demo mode.');
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email,
      displayName,
      role,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const logout = async (): Promise<void> => {
    if (isDemoMode) {
      localStorage.removeItem('easyhomefix_demo_role');
      setCurrentUser(null);
      return;
    }
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (isDemoMode) {
      throw new Error('Password reset is not available in demo mode.');
    }
    await sendPasswordResetEmail(auth, email);
  };

  const demoLogin = (role: UserRole): void => {
    localStorage.setItem('easyhomefix_demo_role', role);
    setCurrentUser(DEMO_USERS[role]);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    isDemoMode,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
