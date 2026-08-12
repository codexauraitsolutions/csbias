// crypto.randomUUID() only works in secure contexts (HTTPS, or localhost) —
// it throws on plain HTTP over a real IP/domain. These ids are only used as
// React list keys for the PDF-section builder, never sent to the server, so
// a non-cryptographic fallback is safe when the native API isn't available.
export function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
