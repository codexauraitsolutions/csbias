import { useAuth } from "../lib/AuthContext.jsx";

export default function RequireSuperAdmin({ children }) {
  const { admin } = useAuth();
  if (admin?.role !== "super_admin") {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-bold mb-2">Access denied</h1>
        <p className="text-gray-500">Only a super admin can manage admin users.</p>
      </div>
    );
  }
  return children;
}
