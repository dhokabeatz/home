import { useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { useUserProfile } from "../../hooks/useUserProfile";
import { usePortfolioStats } from "../../hooks/usePortfolioStats";
import { SiteSettings } from "../../services/api";
import { trackDownload } from "../../services/analytics";

interface HeroSectionProps {
  siteSettings?: SiteSettings | null;
}

export default function HeroSection({ siteSettings }: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { profile } = useUserProfile();
  const { stats, loading: statsLoading } = usePortfolioStats();

  const handleCVDownload = () => {
    // Track CV download
    trackDownload("CV", "pdf");
  };

  // Optimized image URL with Cloudinary transformations for faster loading
  const optimizedImageUrl =
    "https://res.cloudinary.com/doqjvuoyl/image/upload/c_fill,w_384,h_384,q_auto,f_auto/v1754915127/profile-picture_3_lwumpu.jpg";

  return (
    <section
      id="home"
      className="section-padding bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div>
              <p className="text-primary-600 font-medium mb-2">Hello, I'm</p>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-gray-900 leading-tight">
                Henry Agyemang
              </h1>
              <div className="text-xl md:text-2xl text-gray-600 mt-4">
                I'm a{" "}
                <span className="text-primary-600 font-semibold">
                  Cloud Developer & Software Engineer
                </span>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-xl">
              Passionate about creating innovative web solutions and turning
              ideas into powerful digital experiences. Let's build something
              amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Get In Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>

              <a
                href={profile?.cvUrl || "/cv.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCVDownload}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors duration-200"
              >
                Download CV
                <Download className="ml-2 h-5 w-5" />
              </a>
            </div>{" "}
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    `${stats?.projectsCompleted || 0}+`
                  )}
                </div>
                <div className="text-sm text-gray-600">Projects Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    `${stats?.yearsExperience || 0}+`
                  )}
                </div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    `${stats?.clientSatisfaction || 0}%`
                  )}
                </div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-1">
                <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
                  {/* Loading placeholder */}
                  {!imageLoaded && (
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
                  )}
                  <img
                    src={optimizedImageUrl}
                    alt="Henry Agyemang"
                    className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    loading="eager"
                    width="384"
                    height="384"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      // Fallback to original image if optimized fails
                      setImageLoaded(true);
                    }}
                  />
                </div>
              </div>

              {/* Floating elements - Only show after image loads */}
              {imageLoaded && (
                <>
                  <div className="absolute top-10 right-10 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-fade-in">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="absolute bottom-10 left-10 w-12 h-12 bg-primary-100 rounded-full shadow-lg flex items-center justify-center animate-fade-in">
                    <span className="text-xl">🚀</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
