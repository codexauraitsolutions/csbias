import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import PdfInserter from "../components/PdfInserter.jsx";
import RichTextEditor from "../components/RichTextEditor.jsx";

const EMPTY = { title: "", content: "", status: "draft" };

export default function PageEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    api.pages.list().then((pages) => {
      const page = pages.find((p) => String(p.id) === id);
      if (page) setForm(page);
    });
  }, [id, isNew]);

  async function handleSave(status) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, status };
      if (isNew) {
        const created = await api.pages.create(payload);
        navigate(`/pages/${created.id}`);
      } else {
        await api.pages.update(id, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? "New Page" : "Edit Page"}</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <input
          placeholder="Title"
          className="w-full border rounded px-3 py-2 text-lg font-medium"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-gray-600">Content</label>
            <PdfInserter quillRef={quillRef} />
          </div>
          <RichTextEditor ref={quillRef} value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => handleSave("draft")} disabled={saving} className="px-4 py-2 rounded-md border font-medium hover:bg-gray-50 disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => handleSave("published")} disabled={saving} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
