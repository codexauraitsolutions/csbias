export default function WhyChooseUsGrid({ title, description, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="text-center mb-6">
        {title && <h2 className="text-2xl font-semibold">{title}</h2>}
        {description && <p className="text-gray-500 mt-2 whitespace-pre-line">{description}</p>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isDark = item.variant === "dark";
          return (
            <div
              key={item.id}
              className={`group rounded-lg p-5 flex gap-4 transition-colors duration-200 hover:bg-[#213555] ${
                isDark ? "bg-[#A00000] text-white" : "bg-[#f0f0f0] text-black"
              }`}
            >
              {item.iconClass && (
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors duration-200 group-hover:bg-white/15 group-hover:text-white ${
                    isDark ? "bg-white/15 text-white" : "bg-white text-black"
                  }`}
                >
                  <i className={`hw-icon ${item.iconClass}`} />
                </div>
              )}
              <div>
                {item.title && (
                  <h3 className="font-semibold transition-colors duration-200 group-hover:text-white">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p
                    className={`text-sm mt-1 whitespace-pre-line transition-colors duration-200 group-hover:text-white/90 ${
                      isDark ? "text-white/80" : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
