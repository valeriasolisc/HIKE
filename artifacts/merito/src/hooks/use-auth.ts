import { useContext, createContext } from "react";
import { User } from "@workspace/api-client-react/src/generated/api.schemas";

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoaded: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
