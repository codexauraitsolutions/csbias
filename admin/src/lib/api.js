const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("csbias_admin_token");
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("csbias_admin_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    me: () => request("/auth/me"),
    changePassword: (currentPassword, newPassword) =>
      request("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),
  },
  posts: {
    list: () => request("/posts/admin/all"),
    create: (data) => request("/posts", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: () => request("/categories"),
    create: (name) => request("/categories", { method: "POST", body: JSON.stringify({ name }) }),
  },
  pages: {
    list: () => request("/pages/admin/all"),
    create: (data) => request("/pages", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/pages/${id}`, { method: "DELETE" }),
  },
  courses: {
    list: () => request("/courses/admin/all"),
    create: (data) => request("/courses", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/courses/${id}`, { method: "DELETE" }),
  },
  quizzes: {
    list: () => request("/quizzes/admin/all"),
    get: (id) => request(`/quizzes/admin/${id}`),
    attempts: (id) => request(`/quizzes/admin/${id}/attempts`),
    create: (data) => request("/quizzes", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/quizzes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/quizzes/${id}`, { method: "DELETE" }),
    addQuestion: (quizId, data) => request(`/quizzes/${quizId}/questions`, { method: "POST", body: JSON.stringify(data) }),
    updateQuestion: (questionId, data) => request(`/quizzes/questions/${questionId}`, { method: "PUT", body: JSON.stringify(data) }),
    removeQuestion: (questionId) => request(`/quizzes/questions/${questionId}`, { method: "DELETE" }),
  },
  events: {
    list: () => request("/events/admin/all"),
    create: (data) => request("/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/events/${id}`, { method: "DELETE" }),
  },
  forms: {
    list: (formName) => request(`/forms${formName ? `?formName=${formName}` : ""}`),
    remove: (id) => request(`/forms/${id}`, { method: "DELETE" }),
  },
  media: {
    list: () => request("/media"),
    upload: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return request("/media", { method: "POST", body: formData });
    },
    usage: (id) => request(`/media/${id}/usage`),
    remove: (id) => request(`/media/${id}`, { method: "DELETE" }),
  },
  slides: {
    list: () => request("/slides/admin/all"),
    create: (data) => request("/slides", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/slides/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/slides/${id}`, { method: "DELETE" }),
  },
  highlights: {
    list: () => request("/highlights/admin/all"),
    create: (data) => request("/highlights", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/highlights/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/highlights/${id}`, { method: "DELETE" }),
  },
  videos: {
    list: () => request("/videos/admin/all"),
    create: (data) => request("/videos", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/videos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/videos/${id}`, { method: "DELETE" }),
  },
  testimonials: {
    list: () => request("/testimonials/admin/all"),
    create: (data) => request("/testimonials", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/testimonials/${id}`, { method: "DELETE" }),
  },
  faqs: {
    list: () => request("/faqs/admin/all"),
    create: (data) => request("/faqs", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/faqs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/faqs/${id}`, { method: "DELETE" }),
  },
  adminUsers: {
    list: () => request("/admin-users"),
    resources: () => request("/admin-users/resources"),
    create: (data) => request("/admin-users", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/admin-users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/admin-users/${id}`, { method: "DELETE" }),
  },
};
