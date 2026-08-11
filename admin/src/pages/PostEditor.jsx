import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import PdfPicker from "../components/PdfPicker.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import { buildContentFromSections, parseContentToSections } from "../lib/pdfSections.js";
import { extractPdfLinks } from "../lib/extractPdfLinks.js";

const EMPTY = { title: "", excerpt: "", content: "", featuredImg: "", status: "draft", categoryIds: [] };

function newSection() {
  return { id: crypto.randomUUID(), label: "", pdfUrl: "" };
}

export default function PostEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [form, setForm] = useState(EMPTY);
  const [sections, setSections] = useState([newSection()]);
  const [legacyContent, setLegacyContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Tracks whether the featured image came from a category's default image
  // ("auto", so picking a different category should keep replacing it) or
  // was explicitly uploaded/removed by the admin ("manual", so category
  // toggles must leave it alone).
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew) return;
    api.posts.list().then((posts) => {
      const post = posts.find((p) => String(p.id) === id);
      if (!post) return;
      setForm({ ...post, categoryIds: post.categories.map((c) => c.id) });
      setImageSource(post.featuredImg ? "manual" : null);
      const { sections: parsed, legacy } = parseContentToSections(post.content);
      setSections(parsed.length ? parsed : [newSection()]);
      setLegacyContent(legacy);
    });
  }, [id, isNew]);

  useEffect(() => {
    setForm((f) => ({ ...f, content: buildContentFromSections(sections, legacyContent) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, legacyContent]);

  const pdfLinks = useMemo(() => extractPdfLinks(form.content), [form.content]);

  function toggleCategory(category) {
    const active = form.categoryIds.includes(category.id);
    const categoryIds = active
      ? form.categoryIds.filter((c) => c !== category.id)
      : [...form.categoryIds, category.id];
    const shouldAutofill = !active && imageSource !== "manual" && category.defaultImage;

    if (shouldAutofill) setImageSource("auto");
    setForm((f) => ({ ...f, categoryIds, featuredImg: shouldAutofill ? category.defaultImage : f.featuredImg }));
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    const created = await api.categories.create(newCategory.trim());
    setCategories((c) => [...c, created].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((f) => ({ ...f, categoryIds: [...f.categoryIds, created.id] }));
    setNewCategory("");
  }

  function updateSection(sectionId, patch) {
    setSections((secs) => secs.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)));
  }

  function removeSection(sectionId) {
    setSections((secs) => (secs.length > 1 ? secs.filter((s) => s.id !== sectionId) : secs));
  }

  async function handleSave(status) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, status };
      if (isNew) {
        const created = await api.posts.create(payload);
        navigate(`/posts/${created.id}`);
      } else {
        await api.posts.update(id, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? "New Post" : "Edit Post"}</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <input
          placeholder="Title"
          className="w-full border rounded px-3 py-2 text-lg font-medium"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <div>
          <label className="text-sm text-gray-600 block mb-2">Featured image (auto-filled from category, or upload your own)</label>
          <ImageUploader
            value={form.featuredImg}
            onChange={(url) => {
              setImageSource(url ? "manual" : null);
              setForm({ ...form, featuredImg: url });
            }}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = form.categoryIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {isSuperAdmin && (
            <div className="flex gap-2 mt-2">
              <input
                placeholder="New category name"
                className="flex-1 border rounded px-3 py-1.5 text-sm"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
              />
              <button type="button" onClick={handleAddCategory} className="text-sm text-indigo-600 hover:underline shrink-0">
                + Add category
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">PDF sections</label>
            <button
              type="button"
              onClick={() => setSections((secs) => [...secs, newSection()])}
              className="text-sm text-indigo-600 hover:underline"
            >
              + Add PDF section
            </button>
          </div>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="flex gap-2 items-start bg-gray-50 border rounded-lg p-2">
                <input
                  placeholder="Label (e.g. Prelims Edge)"
                  className="w-48 border rounded px-3 py-1.5 text-sm shrink-0"
                  value={section.label}
                  onChange={(e) => updateSection(section.id, { label: e.target.value })}
                />
                <PdfPicker value={section.pdfUrl} onChange={(url) => updateSection(section.id, { pdfUrl: url })} />
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:underline text-sm shrink-0 px-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {legacyContent && (
            <p className="text-xs text-amber-600 mt-2">
              This post also has existing custom content that isn't shown here — it will be kept when you save.
            </p>
          )}
        </div>

        {pdfLinks.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-1">PDFs linked in this post</p>
            <ul className="text-sm space-y-1">
              {pdfLinks.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 rounded-md border font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
