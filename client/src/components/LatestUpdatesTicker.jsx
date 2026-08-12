import { mediaUrl } from "../lib/mediaUrl.js";

export default function LatestUpdatesTicker({ title, description, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-12 text-center">
        {title && <h2 className="text-3xl sm:text-5xl font-light text-black leading-tight">{title}</h2>}
        {description && <p className="text-gray-500 mt-4">{description}</p>}
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
        <div className="flex items-center border border-indigo-200 rounded-full overflow-hidden">
          <div className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-full shrink-0 z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LATEST UPDATES
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-10 py-3 px-6 whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
              {[...items, ...items].map((item, i) => (
                <a
                  key={`${item.id}-${i}`}
                  href={item.linkUrl || "#"}
                  target={item.linkUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-indigo-600 shrink-0"
                >
                  {item.imageUrl && <img src={mediaUrl(item.imageUrl)} alt="" className="w-6 h-6 object-contain" />}
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
