import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MenuItem {
  id: number;
  title: string;
  file_path?: string;
  images: string[];
}

interface MenuState {
  menuItems: MenuItem[];
  nextId: number;

  addMenuItem: (
    item: Omit<MenuItem, "id" | "images"> & { images?: string[] },
  ) => number;
  deleteMenuItem: (id: number) => void;

  addImages: (id: number, imageUrls: string[]) => void;
  removeImage: (id: number, imageUrl: string) => void;

  updateMenuItem: (id: number, updates: Partial<Omit<MenuItem, "id">>) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      menuItems: [],
      nextId: 1,

      addMenuItem: (item) => {
        const newId = get().nextId;
        const newItem: MenuItem = {
          id: newId,
          title: item.title,
          file_path: item.file_path,
          images: item.images ?? [],
        };
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
          nextId: state.nextId + 1,
        }));
        return newId;
      },

      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        })),

      addImages: (id, imageUrls) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id
              ? { ...item, images: [...item.images, ...imageUrls] }
              : item,
          ),
        })),

      removeImage: (id, imageUrl) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  images: item.images.filter((url) => url !== imageUrl),
                }
              : item,
          ),
        })),

      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
    }),
    {
      name: "menu-store", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
