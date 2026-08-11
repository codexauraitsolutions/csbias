import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");
const absoluteUrl = (url) => (url && !/^https?:\/\//.test(url) ? `${ORIGIN}${url}` : url);

const EMPTY = { imageUrl: "", linkUrl: "", order: 0, status: "draft" };

export default function SlidesList() {
  const [slides, setSlides] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = slides
    ? slides.filter((s) => {
        const q = search.trim().toLowerCase();
        return !q || s.imageUrl.toLowerCase().includes(q) || (s.linkUrl || "").toLowerCase().includes(q);
      })
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  function load() {
    api.slides.list().then(setSlides);
  }
  useEffect(load, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editingId) {
        await api.slides.update(editingId, payload);
      } else {
        await api.slides.create(payload);
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(slide) {
    setEditingId(slide.id);
    setForm({ imageUrl: slide.imageUrl, linkUrl: slide.linkUrl || "", order: slide.order, status: slide.status });
  }

  async function handleDelete(id) {
    await api.slides.remove(id);
    load();
  }

  if (!slides) return <p>Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Homepage Slider</h1>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold">{editingId ? "Edit Slide" : "Add Slide"}</h2>
        <ImageUploader value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Upload slide image" />
        <input
          placeholder="Link URL (optional)"
          className="w-full border rounded px-3 py-2"
          value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Order"
            className="border rounded px-3 py-2"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving || !form.imageUrl} className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update Slide" : "Add Slide"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <input
        placeholder="Search slides by image or link URL…"
        className="w-full border rounded px-3 py-2 bg-white"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((slide) => (
          <div key={slide.id} className="flex items-center gap-4 px-5 py-3">
            <img src={absoluteUrl(slide.imageUrl)} alt="" className="w-24 h-14 object-cover rounded border" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">{slide.imageUrl}</p>
              <p className="text-xs text-gray-400">order {slide.order} · {slide.status}</p>
            </div>
            <div className="flex gap-3 text-sm shrink-0">
              <button onClick={() => startEdit(slide)} className="text-indigo-600 hover:underline">Edit</button>
              <ConfirmDeleteButton onConfirm={() => handleDelete(slide.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No slides found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
