import { useState } from "react";
import { useCarousel } from "../lib/useCarousel.js";

// Matches the live site's video widget: a curated static thumbnail with a
// play button, swapped for the real YouTube iframe only once clicked —
// rather than embedding the iframe (and its raw/generic YouTube thumbnail)
// directly.
function VideoPlayer({ videoId, thumbnail }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title="CSB IAS Academy"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="relative w-full h-full block"
      aria-label="Play video"
    >
      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
        <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-2xl">▶</span>
      </span>
    </button>
  );
}

export default function StatsSection({ title, description, items, videoId, videoThumbnail }) {
  const { trackRef, handleScroll, scrollByCard } = useCarousel([items]);

  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="text-center mb-8">
        {title && (
          <h2 className="text-[26px] font-bold" style={{ color: "#0A31A1" }}>
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-3 whitespace-pre-line" style={{ color: "#555555", fontSize: "14px", textTransform: "capitalize" }}>
            {description}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 relative">
          {items.length > 1 && (
            <>
              <button
                onClick={() => scrollByCard(-1)}
                aria-label="Previous"
                className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border shadow items-center justify-center hover:bg-gray-50"
                style={{ color: "#0A31A1" }}
              >
                ←
              </button>
              <button
                onClick={() => scrollByCard(1)}
                aria-label="Next"
                className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border shadow items-center justify-center hover:bg-gray-50"
                style={{ color: "#0A31A1" }}
              >
                →
              </button>
            </>
          )}

          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-6 h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => (
              <div
                key={item.id}
                data-card
                className="snap-start shrink-0 w-full sm:w-[calc(50%-12px)] rounded-xl p-8 text-center"
                style={{ border: "0.8px solid #F1F2F8" }}
              >
                {item.iconClass && (
                  <i className={`hw-icon ${item.iconClass} text-4xl`} style={{ color: "#0A31A1" }} />
                )}
                <h3 className="text-[26px] font-bold mt-3" style={{ color: "#000947" }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-3" style={{ color: "#000947", fontSize: "16px" }}>
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {videoId && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <VideoPlayer videoId={videoId} thumbnail={videoThumbnail} />
          </div>
        )}
      </div>
    </section>
  );
}
