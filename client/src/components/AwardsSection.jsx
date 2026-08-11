import { Link } from "react-router-dom";
import { useCarousel } from "../lib/useCarousel.js";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function AwardsSection({ title, description, items }) {
  const { trackRef, pageCount, activePage, handleScroll, goToPage, scrollByCard } = useCarousel([items]);

  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="text-center mb-8">
        {title && <h2 className="text-[26px] font-bold" style={{ color: "#0A31A1" }}>{title}</h2>}
        {description && <p className="text-gray-500 mt-3 whitespace-pre-line">{description}</p>}
      </div>

      <div className="relative">
        {items.length > 1 && (
          <>
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Previous"
              className="hidden sm:flex absolute -left-4 top-1/3 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border shadow items-center justify-center hover:bg-gray-50"
              style={{ color: "#0A31A1" }}
            >
              ←
            </button>
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Next"
              className="hidden sm:flex absolute -right-4 top-1/3 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border shadow items-center justify-center hover:bg-gray-50"
              style={{ color: "#0A31A1" }}
            >
              →
            </button>
          </>
        )}

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div key={item.id} data-card className="snap-start shrink-0 w-full sm:w-[calc(33.333%-16px)]">
              {item.imageUrl && (
                <img src={mediaUrl(item.imageUrl)} alt="" className="w-full aspect-[3/2] object-cover" />
              )}
              {item.title && (
                <p className="mt-3 text-left" style={{ color: "#000947", fontSize: "21px" }}>
                  {item.title}
                </p>
              )}
            </div>
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
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: i === activePage ? "#0A31A1" : "#c6c6c6" }}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <Link
          to="/page/our-awards"
          className="inline-block border px-6 py-2.5 rounded font-medium hover:bg-blue-50"
          style={{ color: "#0A31A1", borderColor: "#0A31A1" }}
        >
          View All Awards
        </Link>
      </div>
    </section>
  );
}
