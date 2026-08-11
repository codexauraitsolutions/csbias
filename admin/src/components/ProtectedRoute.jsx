import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function ProtectedRoute() {
  const { admin, loading } = useAuth();

  if (loading) return <p className="p-8">Loading…</p>;
  if (!admin) return <Navigate to="/login" replace />;
  return <Outlet />;
}
