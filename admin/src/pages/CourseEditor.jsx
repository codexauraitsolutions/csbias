import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import PdfInserter from "../components/PdfInserter.jsx";
import RichTextEditor from "../components/RichTextEditor.jsx";
import ImageUploader from "../components/ImageUploader.jsx";

const EMPTY = { title: "", summary: "", description: "", thumbnail: "", price: "", duration: "", courseType: "", status: "draft" };

const COURSE_TYPES = [
  { value: "", label: "Generic (no dropdown category)" },
  { value: "general_studies_pcm", label: "General Studies PCM" },
  { value: "degree_civils", label: "Degree + Civils" },
  { value: "mission_ekalavya", label: "Mission Ekalavya" },
  { value: "test_series", label: "Test Series" },
];

export default function CourseEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    api.courses.list().then((courses) => {
      const course = courses.find((c) => String(c.id) === id);
      if (course) setForm(course);
    });
  }, [id, isNew]);

  async function handleSave(status) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, status, price: form.price ? Number(form.price) : null };
      if (isNew) {
        const created = await api.courses.create(payload);
        navigate(`/courses/${created.id}`);
      } else {
        await api.courses.update(id, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? "New Course" : "Edit Course"}</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <input placeholder="Title" className="w-full border rounded px-3 py-2 text-lg font-medium" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <ImageUploader value={form.thumbnail} onChange={(url) => setForm({ ...form, thumbnail: url })} label="Upload thumbnail" />
        <label className="block text-sm text-gray-600">
          Course type (drives which nav dropdown it appears under)
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.courseType || ""}
            onChange={(e) => setForm({ ...form, courseType: e.target.value })}
          >
            {COURSE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Duration (e.g. 12 months)" className="border rounded px-3 py-2" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <input placeholder="Price (INR)" type="number" className="border rounded px-3 py-2" value={form.price || ""} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <textarea placeholder="Summary" rows={2} className="w-full border rounded px-3 py-2" value={form.summary || ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
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
