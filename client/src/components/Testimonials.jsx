import { useRef, useState } from "react";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function Testimonials({ title, accentTitle, afterAccentTitle, description, items }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  function goToCard(index) {
    const track = trackRef.current;
    const card = track?.querySelectorAll("[data-card]")[index];
    if (card) track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }

  function scrollByCard(direction) {
    goToCard(Math.min(Math.max(activeIndex + direction, 0), items.length - 1));
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.querySelectorAll("[data-card]")];
    let nearest = 0;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - track.scrollLeft);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setActiveIndex(nearest);
  }

  return (
    <section>
      <div className="text-center mb-6">
        {title && (
          <h2 className="font-light leading-tight" style={{ color: "#252235", fontSize: "56px", fontFamily: "Heebo, sans-serif" }}>
            {title}
            {accentTitle && (
              <>
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(-35deg, #2575FC 0%, #6A11CB 100%)" }}
                >
                  {accentTitle}
                </span>
                {afterAccentTitle && ` ${afterAccentTitle}`}
              </>
            )}
          </h2>
        )}
        {description && (
          <p className="mt-3 whitespace-pre-line" style={{ color: "#666666", fontSize: "16px" }}>
            {description}
          </p>
        )}
      </div>

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
          {items.map((t) => {
            const card = (
              <div
                className="bg-white h-full flex flex-col items-center text-center"
                style={{ border: "0.8px solid #000947", borderRadius: "10px", padding: "40px 25px 60px", boxShadow: "0 -2px 45px -1px rgba(2,1,1,0.08)" }}
              >
                <span style={{ color: "#B6092B", fontSize: "48px", lineHeight: 1 }}>&ldquo;</span>
                <div className="flex gap-0.5 mt-2" style={{ color: "#000947" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 576 512" fill="currentColor">
                      <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-67.5 128.3 67.5c10.8 5.7 23.9 4.8 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 226c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-3 whitespace-pre-line line-clamp-6" style={{ color: "#000947", fontSize: "16px" }}>
                  {t.review}
                </p>
                {t.photoUrl && (
                  <img src={mediaUrl(t.photoUrl)} alt="" className="w-[66px] h-[66px] rounded-full object-cover mt-4" />
                )}
                <p className="font-bold mt-2" style={{ color: "#000", fontSize: "18px" }}>
                  {t.name}
                </p>
                {t.designation && (
                  <p style={{ color: "#000947", fontSize: "16px" }}>{t.designation}</p>
                )}
              </div>
            );
            return (
              <div key={t.id} data-card className="snap-start shrink-0 w-[300px] sm:w-[360px]">
                {t.linkUrl ? (
                  <a href={t.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                    {card}
                  </a>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {items.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goToCard(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? "bg-[#000947]" : "bg-[#c6c6c6]"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
