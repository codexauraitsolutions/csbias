import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";

const PAGE_SIZE = 9;
const CHANNEL_URL = "https://www.youtube.com/channel/UCZaPDJj6dPfxS3EGywBAMrA/";

export default function Videos() {
  const { data: videos, loading } = useFetch(() => api.videos.list(), []);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (loading) return <p>Loading…</p>;
  if (!videos || videos.length === 0) return <p>No videos yet.</p>;

  const visible = videos.slice(0, visibleCount);
  const hasMore = visibleCount < videos.length;

  return (
    <div>
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to Home
      </Link>

      <div className="text-center mt-3 mb-8">
        <h1 className="text-3xl font-bold">We are on YouTube</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((v) => (
          <a key={v.id} href={v.linkUrl} target="_blank" rel="noopener noreferrer">
            <img src={v.imageUrl} alt={v.title} className="w-full aspect-video object-cover rounded" />
            <p className="mt-2 text-sm" style={{ color: "#000947" }}>
              {v.title}
            </p>
          </a>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: "#333333", color: "#fff" }}
          >
            Load More...
          </button>
        )}
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded text-sm font-medium"
          style={{ backgroundColor: "#FF0000", color: "#fff" }}
        >
          Subscribe
        </a>
      </div>
    </div>
  );
}
