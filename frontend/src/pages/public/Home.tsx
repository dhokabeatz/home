import { useEffect, lazy, Suspense } from "react";
import { useSiteSettings } from "../../hooks/useSiteSettings";

// Simple loading component
const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

// Lazy load the Hero section (critical - load immediately)
import HeroSection from "../../components/sections/HeroSection";

// Lazy load other sections to improve initial bundle size
const AboutSection = lazy(
  () => import("../../components/sections/AboutSection")
);
const SkillsSection = lazy(
  () => import("../../components/sections/SkillsSection")
);
const ProjectsSection = lazy(
  () => import("../../components/sections/ProjectsSection")
);
const ServicesSection = lazy(
  () => import("../../components/sections/ServicesSection")
);
const ContactSection = lazy(
  () => import("../../components/sections/ContactSection")
);

const Home = () => {
  const { siteSettings, loading } = useSiteSettings();

  useEffect(() => {
    document.title = siteSettings?.seoTitle || "Portfolio";
    if (siteSettings?.seoDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", siteSettings.seoDescription);
      }
    }
  }, [siteSettings]);

  // Show loading state only if site settings are still loading
  if (loading) {
    return <SectionLoader />;
  }

  return (
    <div className="pt-16">
      {/* Hero Section - Loaded immediately for LCP */}
      <HeroSection siteSettings={siteSettings} />

      {/* About Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>

      {/* Skills Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <SkillsSection />
      </Suspense>

      {/* Projects Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <ProjectsSection />
      </Suspense>

      {/* Services Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <ServicesSection />
      </Suspense>

      {/* Contact Section - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        <ContactSection />
      </Suspense>
    </div>
  );
};

export default Home;
