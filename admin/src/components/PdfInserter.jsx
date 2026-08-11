import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Mirrors the embed markup the WordPress migration script generates, so
// PDFs inserted from the admin render exactly like the migrated ones.
function embedHtml(absoluteUrl) {
  return `<div class="pdf-embed" style="margin:1.5em 0;"><iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(
    absoluteUrl
  )}&embedded=true" width="100%" height="600" style="border:1px solid #ddd;border-radius:8px;"></iframe><p><a href="${absoluteUrl}" target="_blank" rel="noopener noreferrer">Download PDF</a></p></div>`;
}

// quillRef: ref to the RichTextEditor's underlying <ReactQuill>, from which
// we get the live Quill instance to insert HTML at the cursor. Quill's own
// change event keeps the parent's form state in sync automatically — no
// manual onInsert needed.
export default function PdfInserter({ quillRef }) {
  const [open, setOpen] = useState(false);
  const [pdfs, setPdfs] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && !pdfs) {
      api.media.list().then((all) => setPdfs(all.filter((m) => m.mimeType === "application/pdf")));
    }
  }, [open, pdfs]);

  function insertAtCursor(html) {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true) || { index: quill.getLength() };
    quill.clipboard.dangerouslyPasteHTML(range.index, html, "user");
  }

  function handlePick(media) {
    insertAtCursor(embedHtml(`${ORIGIN}${media.url}`));
    setOpen(false);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await api.media.upload(file);
      setPdfs((prev) => [media, ...(prev || [])]);
      insertAtCursor(embedHtml(`${ORIGIN}${media.url}`));
      setOpen(false);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-indigo-600 hover:underline"
      >
        + Insert PDF
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 bg-white border rounded-lg shadow-lg p-3">
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
