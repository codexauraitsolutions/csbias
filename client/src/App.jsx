import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import BlogList from "./pages/BlogList.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Events from "./pages/Events.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import QuizTake from "./pages/QuizTake.jsx";
import Contact from "./pages/Contact.jsx";
import Videos from "./pages/Videos.jsx";
import StaticPage from "./pages/StaticPage.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quizzes/:slug" element={<QuizTake />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/page/:slug" element={<StaticPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
