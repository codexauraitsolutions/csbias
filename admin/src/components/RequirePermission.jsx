import { useAuth } from "../lib/AuthContext.jsx";

// Frontend-side gate for direct URL navigation to a section you don't have
// permission for (the nav hides these already, but a typed-in URL would
// otherwise still render the page). The API enforces this independently on
// every request either way — this is UX, not the actual security boundary.
export default function RequirePermission({ resource, children }) {
  const { hasAccess } = useAuth();
  if (!hasAccess(resource)) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-bold mb-2">Access denied</h1>
        <p className="text-gray-500">You don't have access to this section. Ask a super admin to grant it.</p>
      </div>
    );
  }
  return children;
}
