import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  add: () => set((state) => ({ user: state.user })),
  remove: () => set(() => ({ user: null })),
}));
