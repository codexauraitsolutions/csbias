import { useRef, useState } from "react";

export default function BeforeAfterSlider({ before, after }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  function updateFromClientX(clientX) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }

  function handlePointerDown(e) {
    dragging.current = true;
    updateFromClientX(e.clientX);
  }
  function handlePointerMove(e) {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  }
  function stopDragging() {
    dragging.current = false;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-lg overflow-hidden select-none cursor-ew-resize"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <img
        src={before}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <div className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none" style={{ left: `${pos}%` }} />
      <div
        className="absolute top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow flex items-center justify-center text-gray-700 pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        ↔
      </div>

      <span className="absolute bottom-3 left-3 text-xs font-semibold bg-black/50 text-white px-2 py-1 rounded pointer-events-none">
        Before
      </span>
      <span className="absolute bottom-3 right-3 text-xs font-semibold bg-black/50 text-white px-2 py-1 rounded pointer-events-none">
        After
      </span>
    </div>
  );
}
