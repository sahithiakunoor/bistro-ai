import { create } from "zustand";
import { API_BASE } from "../constants/api";

export const useMenuStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,

  fetchMenu: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/menu`);
      const data = await res.json();
      if (data.success) {
        set({ categories: data.data.categories, loading: false });
      } else {
        set({ error: "Failed to load menu", loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setSelectedCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
  },

  getItemById: (id) => {
    const { categories } = get();
    for (const cat of categories) {
      const item = cat.items.find((i) => i.id === id);
      if (item) return item;
    }
    return null;
  },

  getAllItems: () => {
    return get().categories.flatMap((c) => c.items);
  },
}));
