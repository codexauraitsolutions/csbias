// Converts between the post editor's PDF-section builder (label + PDF pairs)
// and the HTML stored on Post.content — same <blockquote> + .pdf-embed
// markup the WordPress migration produces, so new posts render identically
// to migrated ones (see server/src/scripts/migrate-from-wp.js resolvePdfEmbeds).

import { newId } from "./uuid.js";

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function embedHtml(label, pdfUrl) {
  const labelHtml = label
    ? `<blockquote class="wp-block-quote"><p><strong>${escapeHtml(label)}</strong></p></blockquote>\n\n`
    : "";
  return `${labelHtml}<div class="pdf-embed" style="margin:1.5em 0;"><iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(
    pdfUrl
  )}&embedded=true" width="100%" height="600" style="border:1px solid #ddd;border-radius:8px;"></iframe><p><a href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Download PDF</a></p></div>`;
}

export function buildContentFromSections(sections, legacyContent = "") {
  const sectionsHtml = sections
    .filter((s) => s.pdfUrl)
    .map((s) => embedHtml(s.label, s.pdfUrl))
    .join("\n\n");
  return [legacyContent.trim(), sectionsHtml].filter(Boolean).join("\n\n");
}

// Parses existing post content back into {label, pdfUrl} sections for
// editing. Anything that isn't a recognized blockquote+pdf-embed pair
// (e.g. a genuine long-form article) is preserved verbatim as `legacy` so
// it's never silently dropped when the post is re-saved.
export function parseContentToSections(html) {
  if (!html) return { sections: [], legacy: "" };

  const doc = new DOMParser().parseFromString(html, "text/html");
  const children = [...doc.body.children];
  const sections = [];
  const consumed = new Set();
  let pendingLabel = null;

  for (const el of children) {
    if (el.tagName === "BLOCKQUOTE") {
      pendingLabel = el.textContent.trim();
      consumed.add(el);
    } else if (el.classList?.contains("pdf-embed")) {
      const link = el.querySelector("a[href]");
      sections.push({ id: newId(), label: pendingLabel || "", pdfUrl: link?.getAttribute("href") || "" });
      consumed.add(el);
      pendingLabel = null;
    }
  }

  if (sections.length === 0) {
    return { sections: [], legacy: html };
  }

  children.forEach((el) => consumed.has(el) && el.remove());
  return { sections, legacy: doc.body.innerHTML.trim() };
}
