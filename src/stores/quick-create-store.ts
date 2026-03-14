import { create } from "zustand";

export type QuickCreateTarget =
  | "accounts"
  | "contacts"
  | "action-items"
  | "meeting-summaries"
  | "ideas"
  | null;

interface QuickCreateState {
  target: QuickCreateTarget;
  open: (target: NonNullable<QuickCreateTarget>) => void;
  clear: () => void;
}

export const useQuickCreateStore = create<QuickCreateState>((set) => ({
  target: null,
  open: (target) => set({ target }),
  clear: () => set({ target: null }),
}));
