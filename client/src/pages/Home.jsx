import { useFetch } from "../lib/useFetch.js";
import { api } from "../lib/api.js";
import HeroSlider from "../components/HeroSlider.jsx";
import LatestUpdatesTicker from "../components/LatestUpdatesTicker.jsx";
import CoursesCarousel from "../components/CoursesCarousel.jsx";
import WhyChooseUsGrid from "../components/WhyChooseUsGrid.jsx";
import HighlightGrid from "../components/HighlightGrid.jsx";
import AwardsSection from "../components/AwardsSection.jsx";
import ExamJourneySection from "../components/ExamJourneySection.jsx";
import StatsSection from "../components/StatsSection.jsx";
import Testimonials from "../components/Testimonials.jsx";
import FaqAccordion from "../components/FaqAccordion.jsx";
import AppPromoSection from "../components/AppPromoSection.jsx";

export default function Home() {
  const { data: courses } = useFetch(() => api.courses.list(), []);
  const { data: slides } = useFetch(() => api.slides.list(), []);
  const { data: latestUpdates } = useFetch(() => api.highlights.list("latest_updates"), []);
  const { data: whyChooseUs } = useFetch(() => api.highlights.list("why_choose_us"), []);
  const { data: examStages } = useFetch(() => api.highlights.list("exam_stages"), []);
  const { data: stats } = useFetch(() => api.highlights.list("stats"), []);
  const { data: studyMaterials } = useFetch(() => api.highlights.list("study_materials"), []);
  const { data: awards } = useFetch(() => api.highlights.list("awards"), []);
  const { data: testimonials } = useFetch(() => api.testimonials.list(), []);
  const { data: faqs } = useFetch(() => api.faqs.list(), []);

  return (
    <div>
      <LatestUpdatesTicker
        title="Latest Announcements & Important Updates"
        description="Your one-stop destination for all CSB IAS ACADEMY notifications. Explore upcoming courses, exam updates, schedules, workshops, and exclusive opportunities designed for UPSC aspirants."
        items={latestUpdates}
      />

      <div className="space-y-16 py-8">
        {slides && <HeroSlider slides={slides} />}

        <CoursesCarousel courses={courses} />

        <WhyChooseUsGrid
          title="What We Provide"
          description='"Everything You Need for UPSC Success Under One Roof"'
          items={whyChooseUs}
        />

        <ExamJourneySection
          title="The UPSC Journey: From Aspirant to Civil Servant"
          description="Understanding the Three Stages of the UPSC Examination — a multi-stage process designed to assess a candidate's knowledge, analytical ability, personality, and suitability for public service."
          items={examStages}
        />

        <StatsSection
          title="Why Choose CSB IAS ACADEMY?"
          description="At CSB IAS Academy, we believe that a student's success depends not only on quality teaching but also on a supportive learning environment. We provide a perfect blend of expert guidance, modern infrastructure, and student-focused facilities to help aspirants stay motivated and achieve their goals."
          items={stats}
          videoId="HtMQMhMmTaI"
          videoThumbnail="/video-thumbnail.webp"
        />

        <HighlightGrid
          title="Comprehensive"
          accentTitle="UPSC Study Materials"
          subtitle="Well-Structured Textbooks and Reference Materials for Complete Civil Services Preparation"
          description="At CSB IAS ACADEMY, we provide carefully selected textbooks and study materials covering every stage of the UPSC Civil Services Examination. These resources help aspirants build strong conceptual clarity, improve analytical skills, and stay updated with current developments."
          items={studyMaterials}
        />

        <AwardsSection
          title="Our Awards"
          description="We are feeling very proud to received such a wonderfull awards from all officials for our hard work. Here are few of our Awards."
          items={awards}
        />

        <Testimonials
          title="Voices of Success:"
          accentTitle="Student & Parent"
          afterAccentTitle="Testimonials"
          description={
            "Discover what our students, parents, and well-wishers have to say about their experience with CSB IAS ACADEMY.\n" +
            "Their feedback reflects our commitment to quality education, personalized guidance, and civil services excellence."
          }
          items={testimonials}
        />

        <FaqAccordion
          title="Frequently Asked Questions (FAQ) - CSB IAS ACADEMY"
          description={
            "Have questions about UPSC preparation, courses, admissions, study materials, mentoring, or the Degree + IAS Integrated Program? Our FAQ section provides quick and clear answers to help you understand everything about CSB IAS ACADEMY and choose the right path for your Civil Services journey.\n" +
            "Explore the FAQs to get instant answers and start your UPSC preparation with confidence!"
          }
          items={faqs}
        />

        <AppPromoSection />
      </div>
    </div>
  );
}
