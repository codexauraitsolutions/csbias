import { useEffect, useState } from "react";
import { mediaUrl } from "../lib/mediaUrl.js";

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/6] min-h-[220px] rounded-lg overflow-hidden bg-gray-900">
      {slides.map((slide, i) => {
        const image = (
          <img
            src={mediaUrl(slide.imageUrl)}
            alt=""
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        );
        return slide.linkUrl ? (
          <a key={slide.id} href={slide.linkUrl} target="_blank" rel="noopener noreferrer">
            {image}
          </a>
        ) : (
          <span key={slide.id}>{image}</span>
        );
      })}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
