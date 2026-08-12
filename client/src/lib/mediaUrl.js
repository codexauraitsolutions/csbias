const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Post/Course/Slide/etc. image fields are either a full URL (old WordPress
// posts that were never rewritten, or an admin who pasted an external link)
// or a local "/uploads/..." path from the migrated media library — this
// normalizes both to something the browser can actually load.
export function mediaUrl(url) {
  if (!url) return url;
  return /^https?:\/\//.test(url) ? url : `${ORIGIN}${url}`;
}

// Migrated Page.content is a raw HTML blob (not a single image field), so
// individual <img>/<a> references to "/uploads/..." can't call mediaUrl()
// themselves — rewrite them at the string level before rendering instead.
export function rewriteContentUploadUrls(html) {
  return (html || "").replaceAll('="/uploads/', `="${ORIGIN}/uploads/`);
}
