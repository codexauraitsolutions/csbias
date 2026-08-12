import { useParams, Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import { sanitizeHtml } from "../lib/sanitize.js";
import { rewriteContentUploadUrls } from "../lib/mediaUrl.js";

export default function StaticPage() {
  const { slug } = useParams();
  const { data: page, loading, error } = useFetch(() => api.pages.get(slug), [slug]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Page not found.</p>;

  return (
    <article className="max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mt-3 mb-6 text-center">{page.title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteContentUploadUrls(page.content)) }}
      />
    </article>
  );
}
