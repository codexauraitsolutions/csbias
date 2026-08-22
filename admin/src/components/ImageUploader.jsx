import { useState } from "react";
import { api } from "../lib/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

function absoluteUrl(url) {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${ORIGIN}${url}`;
}

// Replaces raw "Image URL" text inputs across the admin — uploads a file to
// the media library and stores the returned path, instead of trusting a
// pasted URL (which was usually a stale link back to the old WordPress site).
export default function ImageUploader({ value, onChange, label = "Upload image" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const media = await api.media.upload(file);
      onChange(media.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {value && <img src={absoluteUrl(value)} alt="" className="w-16 h-16 rounded object-cover border shrink-0" />}
        <label className="flex-1 border rounded px-3 py-2 text-sm text-center cursor-pointer hover:bg-gray-50 text-gray-600">
          {uploading ? "Uploading…" : value ? "Change image" : label}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-red-600 text-sm hover:underline shrink-0">
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
