import BeforeAfterSlider from "./BeforeAfterSlider.jsx";

// Served from client/public — see components/Layout.jsx for why this isn't
// a Media Library / uploads path.
const BEFORE_IMAGE = "/exam-journey-before.png";
const AFTER_IMAGE = "/exam-journey-after.png";

export default function ExamJourneySection({ title, description, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="full-bleed" style={{ backgroundColor: "#213555" }}>
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8">
          {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}
          {description && <p className="mt-2 whitespace-pre-line" style={{ color: "#a0b3e9" }}>{description}</p>}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id}>
                {item.title && <h3 className="font-semibold" style={{ color: "#e8f2ff" }}>{item.title}</h3>}
                {item.description && (
                  <p className="text-sm mt-1 whitespace-pre-line" style={{ color: "#a0b3e9" }}>
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <BeforeAfterSlider before={BEFORE_IMAGE} after={AFTER_IMAGE} />
        </div>
      </div>
    </section>
  );
}
