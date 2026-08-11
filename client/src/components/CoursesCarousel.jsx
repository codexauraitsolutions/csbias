import { Link } from "react-router-dom";
import { useCarousel } from "../lib/useCarousel.js";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function CoursesCarousel({ courses }) {
  const { trackRef, pageCount, activePage, handleScroll, goToPage, scrollByCard } = useCarousel([courses]);

  if (!courses || courses.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-semibold text-center mb-6">Explore Our Courses</h2>

      <div className="relative">
        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Previous"
          className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border shadow items-center justify-center hover:bg-gray-50"
        >
          ←
        </button>
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Next"
          className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border shadow items-center justify-center hover:bg-gray-50"
        >
          →
        </button>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {courses.map((c) => (
            <Link
              key={c.id}
              data-card
              to={`/courses/${c.slug}`}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] border rounded-lg overflow-hidden hover:shadow-md transition flex flex-col"
            >
              {c.thumbnail && <img src={mediaUrl(c.thumbnail)} alt={c.title} className="w-full aspect-video object-cover" />}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold line-clamp-2">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-3 flex-1">{c.summary}</p>
                <span className="text-sm font-medium text-indigo-600 mt-3">Read More</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === activePage ? "bg-[#000947]" : "bg-[#c6c6c6]"}`}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <Link
          to="/courses"
          className="inline-block border border-indigo-600 text-indigo-600 px-6 py-2.5 rounded-md font-medium hover:bg-indigo-50"
        >
          View All Courses
        </Link>
      </div>
    </section>
  );
}
