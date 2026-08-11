import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

const EMPTY = { name: "", email: "", password: "", role: "admin", permissions: [] };

const RESOURCE_LABELS = {
  slides: "Homepage Slider",
  highlights: "Homepage Content",
  posts: "Current Affairs",
  courses: "Courses",
  videos: "Videos",
  events: "Events",
  quizzes: "Quiz",
  pages: "Pages",
  forms: "Form Submissions",
  testimonials: "Testimonials",
  faqs: "FAQs",
  media: "Media",
};

export default function UsersList() {
  const { admin: currentAdmin } = useAuth();
  const [users, setUsers] = useState(null);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = users
    ? users.filter((u) => {
        const q = search.trim().toLowerCase();
        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      })
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  function load() {
    api.adminUsers.list().then(setUsers);
  }
  useEffect(() => {
    load();
    api.adminUsers.resources().then(setResources);
  }, []);

  function togglePermission(resource) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(resource)
        ? f.permissions.filter((p) => p !== resource)
        : [...f.permissions, resource],
    }));
  }

  function startEdit(user) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, permissions: user.permissions });
    setError(null);
  }

  function startNew() {
    setEditingId("new");
    setForm(EMPTY);
    setError(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") {
        await api.adminUsers.create(form);
      } else {
        const payload = { name: form.name, role: form.role, permissions: form.permissions };
        if (form.password) payload.password = form.password;
        await api.adminUsers.update(editingId, payload);
      }
      setEditingId(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleteError(null);
    try {
      await api.adminUsers.remove(id);
      setConfirmingDeleteId(null);
      load();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  if (!users) return <p>Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Users</h1>
        {editingId === null && (
          <button onClick={startNew} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            + New Admin
          </button>
        )}
      </div>

      {editingId !== null && (
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">{editingId === "new" ? "New Admin User" : "Edit Admin User"}</h2>

          <input
            required
            placeholder="Name"
            className="w-full border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {editingId === "new" && (
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          )}

          <input
            type="password"
            placeholder={editingId === "new" ? "Password (min 8 characters)" : "New password (leave blank to keep current)"}
            className="w-full border rounded px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={editingId === "new"}
            minLength={8}
          />

          <div>
            <label className="text-sm text-gray-600 block mb-2">Role</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.role === "admin"}
                  onChange={() => setForm({ ...form, role: "admin" })}
                />
                Admin (access limited to sections granted below)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.role === "super_admin"}
                  onChange={() => setForm({ ...form, role: "super_admin" })}
                />
                Super Admin (full access + manage users)
              </label>
            </div>
          </div>

          {form.role === "admin" && (
            <div>
              <label className="text-sm text-gray-600 block mb-2">Sections this admin can access</label>
              <div className="flex flex-wrap gap-2">
                {resources.map((r) => {
                  const active = form.permissions.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => togglePermission(r)}
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {RESOURCE_LABELS[r] || r}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving…" : editingId === "new" ? "Create Admin" : "Save Changes"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <input
        placeholder="Search by name or email…"
        className="w-full border rounded px-3 py-2 bg-white"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((user) => (
          <div key={user.id} className="px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {user.name} <span className="text-gray-400 font-normal">({user.email})</span>
                  {user.id === currentAdmin.id && <span className="text-xs text-indigo-600 ml-2">you</span>}
                </p>
                <p className="text-xs text-gray-400">
                  {user.role === "super_admin" ? "Super Admin — full access" : `Admin — ${user.permissions.length} section(s)`}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(user)} className="text-indigo-600 hover:underline">
                  Edit
                </button>
                {user.id !== currentAdmin.id && confirmingDeleteId !== user.id && (
                  <button
                    onClick={() => {
                      setConfirmingDeleteId(user.id);
                      setDeleteError(null);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {confirmingDeleteId === user.id && (
              <div className="mt-2 flex items-center gap-3 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
                <span>Delete {user.name}'s account? They lose access immediately.</span>
                <button onClick={() => handleDelete(user.id)} className="text-red-700 font-medium hover:underline shrink-0">
                  Yes, delete
                </button>
                <button onClick={() => setConfirmingDeleteId(null)} className="text-gray-500 hover:underline shrink-0">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No admins found.</p>}
        {deleteError && <p className="px-5 py-3 text-red-600 text-sm">{deleteError}</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
