import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/shared/services/firebase'; // Assuming shared firebase config

interface AuthState {
  user: User | null;
  jwtToken: string | null;
  claims: Record<string, any> | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setClaims: (claims: Record<string, any> | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  jwtToken: null,
  claims: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ jwtToken: token }),
  setClaims: (claims) => set({ claims }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Hydration function bound to Firebase
export const initAuthHydration = () => {
  return onAuthStateChanged(auth, async (user) => {
    useAuthStore.getState().setLoading(true);
    if (user) {
      useAuthStore.getState().setUser(user);
      try {
        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setClaims(idTokenResult.claims);
      } catch (error) {
        console.error("Failed to parse custom claims", error);
      }
    } else {
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setToken(null);
      useAuthStore.getState().setClaims(null);
    }
    useAuthStore.getState().setLoading(false);
  });
};
