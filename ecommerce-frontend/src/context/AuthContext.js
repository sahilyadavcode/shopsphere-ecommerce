import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (authResponse) => {
    localStorage.setItem("accessToken", authResponse.accessToken);
    localStorage.setItem("refreshToken", authResponse.refreshToken);
    localStorage.setItem("user", JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    persistSession(data);
    return data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const { data } = await authApi.register({ fullName, email, password });
    persistSession(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const isAdmin = !!user && user.roles && user.roles.includes("ROLE_ADMIN");

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
