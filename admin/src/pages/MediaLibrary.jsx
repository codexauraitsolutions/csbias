import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

const TYPE_ROUTES = { post: "/posts", course: "/courses", event: "/events" };

export default function MediaLibrary() {
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [usageFor, setUsageFor] = useState(null); // media id currently showing usage
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = media
    ? media.filter((m) => m.filename.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  function load() {
    api.media.list().then(setMedia);
  }
  useEffect(load, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.media.upload(file);
      load();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id) {
    await api.media.remove(id);
    load();
  }

  async function handleShowUsage(id) {
    if (usageFor === id) {
      setUsageFor(null);
      return;
    }
    setUsageFor(id);
    setUsage(null);
    setUsageLoading(true);
    try {
      setUsage(await api.media.usage(id));
    } finally {
      setUsageLoading(false);
    }
  }

  if (!media) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <label className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 cursor-pointer">
          {uploading ? "Uploading…" : "+ Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*,.pdf" />
        </label>
      </div>

      <input
        placeholder="Search files by name…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {pageItems.map((m) => {
          const isPdf = m.mimeType === "application/pdf";
          return (
            <div key={m.id} className="bg-white rounded-lg shadow p-2">
              {m.mimeType?.startsWith("image/") ? (
                <img src={`${ORIGIN}${m.url}`} alt={m.filename} className="aspect-square object-cover rounded" />
              ) : (
                <a
                  href={`${ORIGIN}${m.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square flex flex-col items-center justify-center bg-gray-100 rounded text-center hover:bg-gray-200"
                >
                  {isPdf && <span className="text-xs font-bold text-red-600 mb-1">PDF</span>}
                  <span className="text-xs text-gray-500 px-2 break-all line-clamp-3">{m.filename}</span>
                </a>
              )}
              <div className="flex justify-between mt-1">
                <button onClick={() => handleShowUsage(m.id)} className="text-indigo-600 text-xs hover:underline">
                  Where used?
                </button>
                <ConfirmDeleteButton onConfirm={() => handleDelete(m.id)} className="text-xs" />
              </div>

              {usageFor === m.id && (
                <div className="mt-2 border-t pt-2 text-xs">
                  {usageLoading && <p className="text-gray-400">Checking…</p>}
                  {usage && (
                    <>
                      {[...usage.posts, ...usage.courses, ...usage.events].length === 0 && (
                        <p className="text-gray-400">Not used in any content yet.</p>
                      )}
                      {[...usage.posts, ...usage.courses, ...usage.events].map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          to={`${TYPE_ROUTES[item.type]}/${item.id}`}
                          className="block text-indigo-600 hover:underline truncate"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="col-span-full text-center text-gray-400 py-8">No files found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
