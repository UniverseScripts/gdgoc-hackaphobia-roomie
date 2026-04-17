import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, fetchSignInMethodsForEmail, linkWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, facebookProvider, signInWithPopup, signOut, db } from "../lib/firebase";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              ...data,
              role: data.role || 'customer', // Defensive fallback
              id: currentUser.uid
            } as UserProfile);
          } else {
            setUserProfile({
              id: currentUser.uid,
              role: 'customer',
              username: currentUser.displayName || 'User',
              email: currentUser.email || '',
              profile_completed: false
            });
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed", error);
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error: any) {
      // Nếu email đã tồn tại qua provider khác (e.g. Google)
      // → tự động đăng nhập Google rồi link Facebook vào
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        if (!email) throw error;
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes('google.com')) {
          // Đăng nhập Google trước
          const googleResult = await signInWithPopup(auth, googleProvider);
          // Gắn Facebook credential vào tài khoản Google hiện tại
          await linkWithPopup(googleResult.user, facebookProvider);
          return;
        }
      }
      console.error("Facebook login failed", error);
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

  const signupWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginWithGoogle, loginWithFacebook, loginWithEmail, signupWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
