import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, facebookProvider, signOut, db } from "../lib/firebase";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  redirectError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  redirectError: null,
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
  refetchProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  useEffect(() => {
    // ── Subscribe to auth state. signInWithPopup resolves in the same page
    // context, so onAuthStateChanged fires immediately after popup closes.
    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              ...data,
              role: data.role || 'customer',
              id: currentUser.uid
            } as UserProfile);
          } else {
            // New user — no Firestore doc yet, create a minimal profile stub
            setUserProfile({
              id: currentUser.uid,
              role: 'customer',
              username: currentUser.displayName || 'User',
              email: currentUser.email || '',
              profile_completed: false
            });
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => { authUnsubscribe(); };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        setRedirectError('Email này đã đăng ký qua phương thức khác. Vui lòng dùng Google để đăng nhập.');
      }
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        setRedirectError('Email này đã đăng ký qua Google. Vui lòng dùng Google để đăng nhập.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const refetchProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          ...data,
          role: data.role || 'customer',
          id: auth.currentUser.uid
        } as UserProfile);
      }
    } catch (error) {
      console.error("Manual profile refetch failed:", error);
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      redirectError, 
      loginWithGoogle, 
      loginWithFacebook, 
      loginWithEmail, 
      signupWithEmail, 
      logout, 
      refetchProfile 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
