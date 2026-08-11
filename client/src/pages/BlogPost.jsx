import { useParams, Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import { sanitizeHtml } from "../lib/sanitize.js";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useFetch(() => api.posts.get(slug), [slug]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Post not found.</p>;

  return (
    <article className="max-w-3xl mx-auto">
      <Link to="/blog" className="text-sm text-indigo-600 hover:underline">
        ← Back to Blog
      </Link>
      <h1 className="text-3xl font-bold mt-3">{post.title}</h1>
      {post.featuredImg && <img src={mediaUrl(post.featuredImg)} alt={post.title} className="rounded-lg my-6 w-full" />}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
    </article>
  );
}
