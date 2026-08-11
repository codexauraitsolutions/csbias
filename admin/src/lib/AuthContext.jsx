import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("csbias_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .auth.me()
      .then(setAdmin)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, admin } = await api.auth.login(email, password);
    localStorage.setItem("csbias_admin_token", token);
    setAdmin(admin);
  }

  function logout() {
    localStorage.removeItem("csbias_admin_token");
    setAdmin(null);
  }

  function hasAccess(resource) {
    if (!admin) return false;
    return admin.role === "super_admin" || admin.permissions?.includes(resource);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, hasAccess }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
