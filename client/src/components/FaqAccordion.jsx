export default function FaqAccordion({ title, description, items }) {
  if (!items || items.length === 0) return null;

  const mid = Math.ceil(items.length / 2);
  const columns = [items.slice(0, mid), items.slice(mid)];

  return (
    <section id="faq">
      <div className="text-center mb-8">
        {title && (
          <h2 className="font-bold" style={{ color: "#0A31A1", fontSize: "45px", fontFamily: "Heebo, sans-serif" }}>
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-3 whitespace-pre-line" style={{ color: "#666666", fontSize: "16px" }}>
            {description}
          </p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-12">
        {columns.map((column, colIndex) => (
          <div key={colIndex}>
            {column.map((faq) => (
              <div key={faq.id} className="py-5">
                <h3 className="font-bold" style={{ color: "#0A31A1", fontSize: "18px" }}>
                  {faq.question}
                </h3>
                <p className="mt-2" style={{ color: "#000947", fontSize: "16px" }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
