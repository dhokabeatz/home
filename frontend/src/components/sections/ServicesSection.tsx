import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Smartphone, Cloud, Palette, Database, Zap } from "lucide-react";
import { apiService, Service } from "../../services/api";

const iconMap = {
  Code,
  Smartphone,
  Cloud,
  Palette,
  Database,
  Zap,
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiService.getServices({ isActive: true });
        setServices(response.services);
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback to mock data if API fails
        setServices([
          {
            id: "1",
            title: "Web Development",
            description:
              "Building responsive, modern websites and web applications using the latest technologies and best practices.",
            icon: "Code",
            isActive: true,
            order: 1,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            title: "Mobile Development",
            description:
              "Creating cross-platform mobile applications that deliver native performance and user experience.",
            icon: "Smartphone",
            isActive: true,
            order: 2,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "3",
            title: "Cloud Solutions",
            description:
              "Deploying and managing applications on cloud platforms with focus on scalability and performance.",
            icon: "Cloud",
            isActive: true,
            order: 3,
            createdAt: "",
            updatedAt: "",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Code;
  };

  if (loading) {
    return (
      <section id="services" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
            My Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            I offer comprehensive development services to help bring your ideas
            to life with cutting-edge technology and exceptional quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.length > 0 ? (
            services
              .sort((a, b) => a.order - b.order)
              .map((service, index) => {
                const IconComponent = getIcon(service.icon);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 card-hover"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary-600" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                );
              })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                No services available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
