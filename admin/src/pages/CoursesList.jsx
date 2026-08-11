import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePagination } from "../lib/usePagination.js";

export default function CoursesList() {
  const [courses, setCourses] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = courses
    ? courses.filter((c) => c.title.toLowerCase().includes(search.trim().toLowerCase()))
    : [];
  const { page, setPage, totalPages, pageItems } = usePagination(filtered);
  function load() {
    api.courses.list().then(setCourses);
  }
  useEffect(load, []);

  async function handleDelete(id) {
    await api.courses.remove(id);
    load();
  }

  if (!courses) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link to="/courses/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          + New Course
        </Link>
      </div>
      <input
        placeholder="Search courses by title…"
        className="w-full border rounded px-3 py-2 bg-white mb-4"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <div className="bg-white rounded-lg shadow divide-y">
        {pageItems.map((course) => (
          <div key={course.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium">{course.title}</p>
              <p className="text-xs text-gray-400">
                {course.status}
                {course.duration ? ` · ${course.duration}` : ""}
                {course.courseType ? ` · ${course.courseType}` : ""}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link to={`/courses/${course.id}`} className="text-indigo-600 hover:underline">Edit</Link>
              <ConfirmDeleteButton onConfirm={() => handleDelete(course.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No courses found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
