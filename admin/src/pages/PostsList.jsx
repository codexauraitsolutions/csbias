import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { extractPdfLinks } from "../lib/extractPdfLinks.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

export default function PostsList() {
  const [posts, setPosts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pdfsFor, setPdfsFor] = useState(null); // post id currently showing its PDF list
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  function load() {
    api.posts.list().then(setPosts);
  }
  useEffect(load, []);
  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  const filtered = posts
    ? posts.filter((post) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || post.title.toLowerCase().includes(q);
        const matchesCategory = !category || post.categories.some((c) => c.slug === category);
        return matchesSearch && matchesCategory;
      })
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);

  async function handleDelete(id) {
    await api.posts.remove(id);
    load();
  }

  if (!posts) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Current Affairs</h1>
        <Link to="/posts/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          + New Post
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search posts by title…"
          className="flex-1 border rounded px-3 py-2 bg-white"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="border rounded px-3 py-2 bg-white"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((post) => {
          const pdfLinks = extractPdfLinks(post.content);
          return (
            <div key={post.id} className="px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-gray-400">
                    {post.status} · {post.categories.map((c) => c.name).join(", ") || "Uncategorized"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm shrink-0">
                  {pdfLinks.length > 0 && (
                    <button
                      onClick={() => setPdfsFor(pdfsFor === post.id ? null : post.id)}
                      className="text-red-600 hover:underline"
                    >
                      {pdfLinks.length} PDF{pdfLinks.length > 1 ? "s" : ""}
                    </button>
                  )}
                  {post.status === "published" && (
                    <a
                      href={`${CLIENT_URL}/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      View
                    </a>
                  )}
                  <Link to={`/posts/${post.id}`} className="text-indigo-600 hover:underline">
                    Edit
                  </Link>
                  <ConfirmDeleteButton onConfirm={() => handleDelete(post.id)} />
                </div>
              </div>

              {pdfsFor === post.id && (
                <ul className="mt-2 pl-1 space-y-1 text-xs border-t pt-2">
                  {pdfLinks.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No posts found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
