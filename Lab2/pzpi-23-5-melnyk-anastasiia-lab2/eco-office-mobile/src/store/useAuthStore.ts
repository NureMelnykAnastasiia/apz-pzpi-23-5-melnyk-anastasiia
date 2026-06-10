import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';


export type Role = 'ADMIN' | 'OFFICE_MANAGER' | 'FLORIST' | 'CLEANER';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      login: (token, user) => set({ token, user, role: user.role }),
      logout: () => set({ token: null, user: null, role: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);