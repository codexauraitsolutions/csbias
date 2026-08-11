import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");
const absoluteUrl = (url) => (url && !/^https?:\/\//.test(url) ? `${ORIGIN}${url}` : url);

const EMPTY = { title: "", description: "", imageUrl: "", linkUrl: "", order: 0, status: "draft" };

export default function VideosList() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.videos.list().then(setItems);
  }
  useEffect(load, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editingId) {
        await api.videos.update(editingId, payload);
      } else {
        await api.videos.create(payload);
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
      title: item.title || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      linkUrl: item.linkUrl || "",
      order: item.order,
      status: item.status,
    });
  }

  async function handleDelete(id) {
    await api.videos.remove(id);
    load();
  }

  const filtered = items
    ? items.filter((i) => (i.title || "").toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  if (!items) return <p>Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">YouTube Videos</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold">{editingId ? "Edit Video" : "Add Video"}</h2>
        <input placeholder="Title" className="w-full border rounded px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description (optional)" rows={2} className="w-full border rounded px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <ImageUploader label="Upload thumbnail" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
        <input
          placeholder="YouTube video URL"
          className="w-full border rounded px-3 py-2"
          value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
        />
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
        placeholder="Search videos by title…"
        className="w-full border rounded px-3 py-2 bg-white"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3">
            {item.imageUrl && <img src={absoluteUrl(item.imageUrl)} alt="" className="w-16 h-10 object-cover rounded shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-400">order {item.order} · {item.status}</p>
            </div>
            <div className="flex gap-3 text-sm shrink-0">
              <button onClick={() => startEdit(item)} className="text-indigo-600 hover:underline">Edit</button>
              <ConfirmDeleteButton onConfirm={() => handleDelete(item.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No videos found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
