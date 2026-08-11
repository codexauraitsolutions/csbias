import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");
const absoluteUrl = (url) => (url && !/^https?:\/\//.test(url) ? `${ORIGIN}${url}` : url);

const EMPTY = { name: "", designation: "", review: "", photoUrl: "", linkUrl: "", order: 0, status: "draft" };

export default function TestimonialsList() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = items
    ? items.filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  function load() {
    api.testimonials.list().then(setItems);
  }
  useEffect(load, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editingId) {
        await api.testimonials.update(editingId, payload);
      } else {
        await api.testimonials.create(payload);
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      designation: item.designation || "",
      review: item.review,
      photoUrl: item.photoUrl || "",
      linkUrl: item.linkUrl || "",
      order: item.order,
      status: item.status,
    });
  }

  async function handleDelete(id) {
    await api.testimonials.remove(id);
    load();
  }

  if (!items) return <p>Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Testimonials</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="Name" className="border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Designation" className="border rounded px-3 py-2" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
        </div>
        <textarea required placeholder="Review" rows={3} className="w-full border rounded px-3 py-2" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
        <ImageUploader value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} label="Upload photo" />
        <input placeholder="Link URL (optional)" className="w-full border rounded px-3 py-2" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Order" className="border rounded px-3 py-2" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          <select className="border rounded px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <input
        placeholder="Search testimonials by name…"
        className="w-full border rounded px-3 py-2 bg-white"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3">
            {item.photoUrl && <img src={absoluteUrl(item.photoUrl)} alt="" className="w-10 h-10 rounded-full object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-400">order {item.order} · {item.status}</p>
            </div>
            <div className="flex gap-3 text-sm shrink-0">
              <button onClick={() => startEdit(item)} className="text-indigo-600 hover:underline">Edit</button>
              <ConfirmDeleteButton onConfirm={() => handleDelete(item.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No testimonials found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
