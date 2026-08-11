import { useEffect, useRef, useState } from "react";

export function useCarousel(deps = []) {
  const trackRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  function recomputePages() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setPageCount(Math.max(1, Math.round(track.scrollWidth / track.clientWidth)));
  }

  useEffect(() => {
    recomputePages();
    window.addEventListener("resize", recomputePages);
    return () => window.removeEventListener("resize", recomputePages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActivePage(Math.round(track.scrollLeft / track.clientWidth));
  }

  function goToPage(page) {
    trackRef.current?.scrollTo({ left: page * trackRef.current.clientWidth, behavior: "smooth" });
  }

  function scrollByCard(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const amount = (card?.offsetWidth || 300) + 24;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return { trackRef, pageCount, activePage, handleScroll, goToPage, scrollByCard };
}
