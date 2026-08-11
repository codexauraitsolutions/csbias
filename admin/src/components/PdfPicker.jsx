import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Inline PDF picker used by the post editor's PDF-section builder — lets an
// admin attach an existing uploaded PDF or upload a new one without leaving
// the section row.
export default function PdfPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pdfs, setPdfs] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && !pdfs) {
      api.media.list().then((all) => setPdfs(all.filter((m) => m.mimeType === "application/pdf")));
    }
  }, [open, pdfs]);

  function absoluteUrl(media) {
    return `${ORIGIN}${media.url}`;
  }

  function handlePick(media) {
    onChange(absoluteUrl(media));
    setOpen(false);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await api.media.upload(file);
      setPdfs((prev) => [media, ...(prev || [])]);
      onChange(absoluteUrl(media));
      setOpen(false);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50 w-full text-left truncate text-gray-700"
      >
        {value ? decodeURIComponent(value.split("/").pop()) : "Choose PDF…"}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 bg-white border rounded-lg shadow-lg p-3">
          <label className="block w-full text-center bg-indigo-600 text-white text-sm font-medium rounded-md py-2 cursor-pointer hover:bg-indigo-700 mb-3">
            {uploading ? "Uploading…" : "Upload new PDF"}
            <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <p className="text-xs text-gray-400 mb-1">Or choose an existing PDF:</p>
          <div className="max-h-56 overflow-y-auto space-y-1">
            {pdfs === null && <p className="text-xs text-gray-400">Loading…</p>}
            {pdfs?.length === 0 && <p className="text-xs text-gray-400">No PDFs uploaded yet.</p>}
            {pdfs?.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handlePick(m)}
                className="block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-gray-100 truncate"
                title={m.filename}
              >
                {m.filename}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
