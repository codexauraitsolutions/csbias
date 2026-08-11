import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RequirePermission from "./components/RequirePermission.jsx";
import RequireSuperAdmin from "./components/RequireSuperAdmin.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PostsList from "./pages/PostsList.jsx";
import PostEditor from "./pages/PostEditor.jsx";
import PagesList from "./pages/PagesList.jsx";
import PageEditor from "./pages/PageEditor.jsx";
import CoursesList from "./pages/CoursesList.jsx";
import CourseEditor from "./pages/CourseEditor.jsx";
import QuizzesList from "./pages/QuizzesList.jsx";
import QuizEditor from "./pages/QuizEditor.jsx";
import QuizAttempts from "./pages/QuizAttempts.jsx";
import EventsList from "./pages/EventsList.jsx";
import EventEditor from "./pages/EventEditor.jsx";
import FormsList from "./pages/FormsList.jsx";
import MediaLibrary from "./pages/MediaLibrary.jsx";
import SlidesList from "./pages/SlidesList.jsx";
import HighlightsList from "./pages/HighlightsList.jsx";
import VideosList from "./pages/VideosList.jsx";
import TestimonialsList from "./pages/TestimonialsList.jsx";
import FaqsList from "./pages/FaqsList.jsx";
import UsersList from "./pages/UsersList.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/posts" element={<RequirePermission resource="posts"><PostsList /></RequirePermission>} />
          <Route path="/posts/:id" element={<RequirePermission resource="posts"><PostEditor /></RequirePermission>} />

          <Route path="/pages" element={<RequirePermission resource="pages"><PagesList /></RequirePermission>} />
          <Route path="/pages/:id" element={<RequirePermission resource="pages"><PageEditor /></RequirePermission>} />

          <Route path="/courses" element={<RequirePermission resource="courses"><CoursesList /></RequirePermission>} />
          <Route path="/courses/:id" element={<RequirePermission resource="courses"><CourseEditor /></RequirePermission>} />

          <Route path="/quizzes" element={<RequirePermission resource="quizzes"><QuizzesList /></RequirePermission>} />
          <Route path="/quizzes/:id" element={<RequirePermission resource="quizzes"><QuizEditor /></RequirePermission>} />
          <Route path="/quizzes/:id/attempts" element={<RequirePermission resource="quizzes"><QuizAttempts /></RequirePermission>} />

          <Route path="/events" element={<RequirePermission resource="events"><EventsList /></RequirePermission>} />
          <Route path="/events/:id" element={<RequirePermission resource="events"><EventEditor /></RequirePermission>} />

          <Route path="/forms" element={<RequirePermission resource="forms"><FormsList /></RequirePermission>} />
          <Route path="/media" element={<RequirePermission resource="media"><MediaLibrary /></RequirePermission>} />
          <Route path="/slides" element={<RequirePermission resource="slides"><SlidesList /></RequirePermission>} />
          <Route path="/highlights" element={<RequirePermission resource="highlights"><HighlightsList /></RequirePermission>} />
          <Route path="/videos" element={<RequirePermission resource="videos"><VideosList /></RequirePermission>} />
          <Route path="/testimonials" element={<RequirePermission resource="testimonials"><TestimonialsList /></RequirePermission>} />
          <Route path="/faqs" element={<RequirePermission resource="faqs"><FaqsList /></RequirePermission>} />

          <Route path="/users" element={<RequireSuperAdmin><UsersList /></RequireSuperAdmin>} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>
    </Routes>
  );
}
