import { create } from "zustand";
import { User } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("hike_token"),
  setAuth: (user, token) => {
    localStorage.setItem("hike_token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("hike_token");
    set({ user: null, token: null });
  },
}));
