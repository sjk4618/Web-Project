import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  // 필요하다면 점수, 게임 상태 등도 추가
}));
