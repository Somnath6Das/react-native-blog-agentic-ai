import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  email: string;
  name: string;
  id: string;
  avatar_url: string;
};

type AuthStore = {
  user: User | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      // actions
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAuthStore;
