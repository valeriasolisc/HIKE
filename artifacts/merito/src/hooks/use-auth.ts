import { useState, useEffect, useCallback } from "react";
import { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("merito_token");
      const storedUser = localStorage.getItem("merito_user");
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to parse auth from localStorage", err);
      localStorage.removeItem("merito_token");
      localStorage.removeItem("merito_user");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("merito_token", newToken);
    localStorage.setItem("merito_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("merito_token");
    localStorage.removeItem("merito_user");
    setToken(null);
    setUser(null);
    setLocation("/login");
  }, [setLocation]);

  return { token, user, isLoaded, login, logout };
}
