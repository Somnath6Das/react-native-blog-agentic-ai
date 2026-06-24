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
  updateAvatar: (avatar_url: string) => void; // add this
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
      updateAvatar: (avatar_url) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatar_url } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAuthStore;
