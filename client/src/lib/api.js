const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  posts: {
    list: (params = {}) => request(`/posts?${new URLSearchParams(params)}`),
    get: (slug) => request(`/posts/${slug}`),
  },
  pages: {
    get: (slug) => request(`/pages/${slug}`),
  },
  courses: {
    list: (params = {}) => request(`/courses?${new URLSearchParams(params)}`),
    get: (slug) => request(`/courses/${slug}`),
  },
  slides: {
    list: () => request("/slides"),
  },
  highlights: {
    list: (group) => request(`/highlights${group ? `?group=${group}` : ""}`),
  },
  videos: {
    list: () => request("/videos"),
  },
  testimonials: {
    list: () => request("/testimonials"),
  },
  faqs: {
    list: () => request("/faqs"),
  },
  quizzes: {
    list: () => request("/quizzes"),
    get: (slug) => request(`/quizzes/${slug}`),
    submit: (slug, payload) =>
      request(`/quizzes/${slug}/attempts`, { method: "POST", body: JSON.stringify(payload) }),
  },
  events: {
    list: () => request("/events"),
  },
  forms: {
    submit: (formName, data) =>
      request(`/forms/${formName}`, { method: "POST", body: JSON.stringify(data) }),
  },
};
