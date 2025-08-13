import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService, Project } from "../../services/api";
import PaymentModal from "../modals/PaymentModal";
import { useAlert } from "../../contexts/AlertContext";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { showSuccess } = useAlert();

  // Fetch published projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects({
        status: "PUBLISHED",
        limit: 6, // Show only first 6 projects on homepage
      });
      setProjects(response.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Fallback to empty array on error
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleBuyClick = (project: Project) => {
    setSelectedProject(project);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    console.log("Payment successful:", reference);
    setIsPaymentModalOpen(false);
    setSelectedProject(null);
    showSuccess(
      "Payment Successful!",
      "Thank you for your purchase! You now have access to the project source code."
    );
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A showcase of my recent work demonstrating various technologies,
            problem-solving approaches, and creative solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 card-hover"
            >
              <div className="relative">
                <img
                  src={
                    project.screenshots[0]?.url ||
                    "https://images.pexels.com/photos/34577/pexels-photo.jpg"
                  }
                  alt={project.screenshots[0]?.alt || project.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.pexels.com/photos/34577/pexels-photo.jpg";
                  }}
                />
                {project.isPaid && (
                  <div className="absolute top-4 right-4 bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Premium
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                      title="View Demo"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}

                  {/* Conditional Code/Buy Button */}
                  {project.isPaid ? (
                    <button
                      onClick={() => handleBuyClick(project)}
                      className="p-2 bg-green-500/80 backdrop-blur-sm rounded-full text-white hover:bg-green-600/80 transition-colors"
                      title="Buy Project"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  ) : (
                    project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        title="View Code"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )
                  )}

                  <Link
                    to={`/projects/${project.id}`}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  {project.isPaid && project.price && (
                    <span className="text-lg font-bold text-primary-600">
                      {project.currency} {project.price}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                  >
                    View Details <Eye className="ml-1 h-4 w-4" />
                  </Link>

                  {project.isPaid ? (
                    <button
                      onClick={() => handleBuyClick(project)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy Now
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                        >
                          <Github className="mr-1 h-4 w-4" />
                          Code
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/henryagyemang"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <Github className="mr-2 h-5 w-5" />
            View All Projects on GitHub
          </a>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {selectedProject && (
        <PaymentModal
          project={selectedProject}
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </section>
  );
}
