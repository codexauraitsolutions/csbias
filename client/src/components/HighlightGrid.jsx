import { mediaUrl } from "../lib/mediaUrl.js";

export default function HighlightGrid({ title, accentTitle, subtitle, description, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="text-center mb-10">
        {title && (
          <h2 className="text-[45px] font-semibold leading-tight" style={{ color: "#101010", fontFamily: "Archivo, sans-serif" }}>
            {title}
            {accentTitle && (
              <span className="italic font-bold" style={{ color: "#DD2476", fontFamily: '"Playfair Display", sans-serif' }}>
                {" "}
                {accentTitle}
              </span>
            )}
          </h2>
        )}
        {subtitle && (
          <h4 className="mt-2" style={{ color: "#0A31A1", fontSize: "22px", fontWeight: 700, fontFamily: "Urbanist" }}>
            {subtitle}
          </h4>
        )}
        {description && (
          <p className="mt-3 whitespace-pre-line" style={{ color: "#585367", fontSize: "16px", fontFamily: "Roboto, sans-serif" }}>
            {description}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group bg-white rounded-md overflow-hidden text-center">
            {item.imageUrl && (
              <img
                src={mediaUrl(item.imageUrl)}
                alt={item.title || ""}
                className="w-full aspect-[3/2] object-cover rounded-t-md"
              />
            )}
            <div className="pt-5">
              {item.title && (
                <h3
                  className="text-[23px] font-medium text-[#101010] transition-colors group-hover:text-[#2575FC]"
                  style={{ fontFamily: "Archivo, sans-serif" }}
                >
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="mt-3 px-2" style={{ color: "#585367", fontSize: "16px", fontFamily: "Roboto, sans-serif" }}>
                  {item.description}
                </p>
              )}
              <span
                className="inline-block mt-4 mb-2 rounded border-[1.6px] border-[#DD2476] text-[#101010] transition-colors group-hover:text-white group-hover:border-transparent group-hover:bg-[linear-gradient(100deg,#FF512F_0%,#DD2476_100%)]"
                style={{ padding: "12px 30px", fontSize: "14px", fontWeight: 500 }}
              >
                Read More
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
