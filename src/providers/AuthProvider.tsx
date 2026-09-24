"use client";

import * as React from "react";

export type Role = "STUDENT" | "COLLEGE" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  profileId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<any>;
  loginWithGoogle: (email: string) => Promise<any>;
  register: (email: string, passwordHash: string, role: Role) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const refreshUser = React.useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/auth/me", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        setUser(null);
        setLoading(false);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setUser(null);
        setLoading(false);
        return;
      }

      const me = await res.json();
      if (me.role === "ADMIN" || me.role === "SUPER_ADMIN" || me.role === "CONTENT_MANAGER") {
        setUser(null);
        setLoading(false);
        return;
      }

      if (me.token && typeof window !== "undefined") {
        localStorage.setItem("token", me.token);
      }

      setUser({
        id: me.id,
        email: me.email,
        role: me.role as Role,
        name: me.name || (me.role === "STUDENT" ? me.student?.name : me.college?.name) || me.email?.split("@")[0] || "User Account",
        profileId: me.role === "STUDENT" ? me.student?.id : me.role === "COLLEGE" ? me.college?.id : null,
      });
    } catch (err) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, passwordHash: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordHash }),
      });

      if (!response.ok) {
        let errorMessage = "Invalid credentials";
        try {
          if (response.headers.get("content-type")?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as Role,
        name: data.user.name,
        profileId: data.user.profileId,
      });

      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isGoogle: true }),
      });

      if (!response.ok) {
        let errorMessage = "Google authentication failed";
        try {
          if (response.headers.get("content-type")?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as Role,
        name: data.user.name,
        profileId: data.user.profileId,
      });

      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, passwordHash: string, role: Role) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordHash, role }),
      });

      if (!response.ok) {
        let errorMessage = "Registration failed";
        try {
          if (response.headers.get("content-type")?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as Role,
        name: data.user.name,
        profileId: data.user.profileId,
      });

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
