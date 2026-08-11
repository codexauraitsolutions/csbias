import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import PdfInserter from "../components/PdfInserter.jsx";
import RichTextEditor from "../components/RichTextEditor.jsx";

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const EMPTY = { title: "", description: "", location: "", startAt: "", endAt: "", status: "draft" };

export default function EventEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    api.events.list().then((events) => {
      const event = events.find((e) => String(e.id) === id);
      if (event) setForm({ ...event, startAt: toLocalInput(event.startAt), endAt: toLocalInput(event.endAt) });
    });
  }, [id, isNew]);

  async function handleSave(status) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, status };
      if (isNew) {
        const created = await api.events.create(payload);
        navigate(`/events/${created.id}`);
      } else {
        await api.events.update(id, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? "New Event" : "Edit Event"}</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <input placeholder="Title" className="w-full border rounded px-3 py-2 text-lg font-medium" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Location" className="w-full border rounded px-3 py-2" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-gray-600">
            Start
            <input type="datetime-local" className="w-full border rounded px-3 py-2 mt-1" value={form.startAt || ""} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
          </label>
          <label className="text-sm text-gray-600">
            End
            <input type="datetime-local" className="w-full border rounded px-3 py-2 mt-1" value={form.endAt || ""} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          </label>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-gray-600">Description</label>
            <PdfInserter quillRef={quillRef} />
          </div>
          <RichTextEditor ref={quillRef} value={form.description} onChange={(html) => setForm({ ...form, description: html })} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => handleSave("draft")} disabled={saving} className="px-4 py-2 rounded-md border font-medium hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
          <button onClick={() => handleSave("published")} disabled={saving} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">Publish</button>
        </div>
      </div>
    </div>
  );
}
