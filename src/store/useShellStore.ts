import { create } from "zustand";

type ShellState = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

export const useShellStore = create<ShellState>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
}));
