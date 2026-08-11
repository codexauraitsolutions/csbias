import DOMPurify from "dompurify";

// Migrated WordPress content is HTML we render via dangerouslySetInnerHTML.
// It's currently trusted (came from the old site or the admin panel), but
// sanitizing at render time is cheap defense-in-depth against a compromised
// admin session or a maliciously pasted snippet turning into stored XSS for
// every visitor. iframe/allow are permitted since migrated PDF embeds rely on them.
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || "", {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
  });
}
