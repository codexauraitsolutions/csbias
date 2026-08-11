import { useParams, Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import { sanitizeHtml } from "../lib/sanitize.js";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function CourseDetail() {
  const { slug } = useParams();
  const { data: course, loading, error } = useFetch(() => api.courses.get(slug), [slug]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Course not found.</p>;

  return (
    <article className="max-w-3xl mx-auto">
      <Link to="/courses" className="text-sm text-indigo-600 hover:underline">
        ← Back to Courses
      </Link>
      <h1 className="text-3xl font-bold mt-3">{course.title}</h1>
      {course.duration && <p className="text-gray-500 mt-1">{course.duration}</p>}
      {course.thumbnail && <img src={mediaUrl(course.thumbnail)} alt={course.title} className="rounded-lg my-6 w-full" />}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.description) }} />
    </article>
  );
}
