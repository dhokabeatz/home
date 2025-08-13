import { motion } from "framer-motion";
import { Code, Coffee, Users, Trophy } from "lucide-react";
import {
  useAboutContent,
  DEFAULT_ABOUT_CONTENT,
} from "../../hooks/useAboutContent";

export default function AboutSection() {
  const { content, imageUrl, loading, error } = useAboutContent();

  const features = [
    {
      icon: Code,
      title: "Clean Code",
      description: "Writing maintainable, scalable, and efficient code",
    },
    {
      icon: Coffee,
      title: "Problem Solver",
      description: "Turning complex challenges into simple solutions",
    },
    {
      icon: Users,
      title: "Team Player",
      description: "Collaborating effectively with diverse teams",
    },
    {
      icon: Trophy,
      title: "Quality Focused",
      description: "Delivering exceptional results that exceed expectations",
    },
  ];

  // Use dynamic content with fallbacks
  const displayContent = {
    heading: content.heading || DEFAULT_ABOUT_CONTENT.heading,
    subtitle: content.subtitle || DEFAULT_ABOUT_CONTENT.subtitle,
    paragraph1: content.paragraph1 || DEFAULT_ABOUT_CONTENT.paragraph1,
    paragraph2: content.paragraph2 || DEFAULT_ABOUT_CONTENT.paragraph2,
  };

  // Use dynamic image with fallback
  const displayImageUrl =
    imageUrl ||
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";

  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {loading ? (
            <>
              {/* Loading skeleton for heading */}
              <div className="h-12 bg-gray-200 rounded-lg mx-auto mb-4 max-w-md animate-pulse"></div>
              {/* Loading skeleton for subtitle */}
              <div className="h-6 bg-gray-200 rounded-lg mx-auto max-w-2xl animate-pulse"></div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
                {displayContent.heading}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {displayContent.subtitle}
              </p>
            </>
          )}
          {error && (
            <div className="text-red-600 text-sm mt-2">
              Failed to load content. Using default content.
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {loading ? (
                <>
                  {/* Loading skeleton for paragraphs */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    {displayContent.paragraph1}
                  </p>

                  <p className="text-gray-600 leading-relaxed">
                    {displayContent.paragraph2}
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors duration-200"
                >
                  <feature.icon className="h-8 w-8 text-primary-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-80 h-96 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 p-6">
                {loading ? (
                  // Loading skeleton for image
                  <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <img
                    src={displayImageUrl}
                    alt="About section"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      // Fallback to default image on error
                      (e.target as HTMLImageElement).src =
                        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg";
                    }}
                  />
                )}
              </div>

              {/* Achievement badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                <Trophy className="h-8 w-8 text-accent-500" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
