import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import { mediaUrl } from "../lib/mediaUrl.js";

// Windowed page list (1, …, 3 4 5 6 7, …, N) — matches the live site's own
// pagination, which never renders every page number (that's what made the
// old version overflow off-screen on categories with 50+ pages).
function getPageNumbers(current, total) {
  const delta = 2;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");
  range.unshift(1);
  if (total > 1) range.push(total);
  return range;
}

export default function BlogList() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const { data, loading, error } = useFetch(
    () => api.posts.list({ page, pageSize: 9, ...(category ? { category } : {}) }),
    [page, category]
  );

  if (loading) return <p>Loading posts…</p>;
  if (error) return <p className="text-red-600">Failed to load posts: {error.message}</p>;

  const totalPages = Math.ceil((data.total || 0) / data.pageSize);
  const categoryLabel = data.posts[0]?.categories?.find((c) => c.slug === category)?.name;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Blog{categoryLabel ? ` — ${categoryLabel}` : ""}
        {category && (
          <Link to="/blog" className="ml-3 text-sm font-normal text-indigo-600 hover:underline align-middle">
            Clear filter
          </Link>
        )}
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="border rounded-lg p-5 hover:shadow-md transition">
            {post.featuredImg && (
              <img src={mediaUrl(post.featuredImg)} alt={post.title} className="rounded-md mb-3 aspect-video object-cover" />
            )}
            <h2 className="font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-3">{post.excerpt}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              {post.categories?.map((c) => (
                <span key={c.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  {c.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${p === page ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
