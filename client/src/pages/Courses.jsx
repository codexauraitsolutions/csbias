import { Link, useSearchParams } from "react-router-dom";
import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import { mediaUrl } from "../lib/mediaUrl.js";

const TYPE_LABELS = {
  general_studies_pcm: "General Studies PCM",
  degree_civils: "Degree + Civils",
  mission_ekalavya: "Mission Ekalavya",
  test_series: "Test Series",
};

export default function Courses() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || undefined;

  const { data: courses, loading, error } = useFetch(
    () => api.courses.list(type ? { type } : {}),
    [type]
  );

  if (loading) return <p>Loading courses…</p>;
  if (error) return <p className="text-red-600">Failed to load courses: {error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Courses{type ? ` — ${TYPE_LABELS[type] || type}` : ""}
        {type && (
          <Link to="/courses" className="ml-3 text-sm font-normal text-indigo-600 hover:underline align-middle">
            Clear filter
          </Link>
        )}
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.id} to={`/courses/${course.slug}`} className="border rounded-lg p-5 hover:shadow-md transition">
            {course.thumbnail && (
              <img src={mediaUrl(course.thumbnail)} alt={course.title} className="rounded-md mb-3 aspect-video object-cover" />
            )}
            <h2 className="font-semibold">{course.title}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.summary}</p>
            {course.duration && <p className="text-xs text-gray-400 mt-2">{course.duration}</p>}
          </Link>
        ))}
        {courses.length === 0 && <p className="text-gray-400 col-span-full">No courses in this category yet.</p>}
      </div>
    </div>
  );
}
