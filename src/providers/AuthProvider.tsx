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
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Session expired");
      }

      const me = await res.json();
      setUser({
        id: me.id,
        email: me.email,
        role: me.role as Role,
        name: me.role === "STUDENT" ? me.student?.name : me.college?.name || "User",
        profileId: me.role === "STUDENT" ? me.student?.id : me.role === "COLLEGE" ? me.college?.id : null,
      });
    } catch (err) {
      console.error("Failed to load user session:", err);
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Google authentication failed");
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
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
