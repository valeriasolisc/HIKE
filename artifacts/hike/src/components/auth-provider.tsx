import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: user, isError, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  useEffect(() => {
    if (user && token) {
      setAuth(user, token);
    }
  }, [user, token, setAuth]);

  useEffect(() => {
    if (isError) {
      logout();
      setLocation("/login");
    }
  }, [isError, logout, setLocation]);

  if (token && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
