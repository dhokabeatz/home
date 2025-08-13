import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Tag,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiService, Project } from "../../services/api";
import PaymentModal from "../../components/modals/PaymentModal";
import { useAlert } from "../../contexts/AlertContext";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { showSuccess } = useAlert();

  // Fetch project details
  const fetchProject = async () => {
    if (!id) {
      setError("Invalid project ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getProject(id);
      setProject(response);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Project not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleBuyClick = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    console.log("Payment successful:", reference);
    setIsPaymentModalOpen(false);
    showSuccess(
      "Payment Successful!",
      "Thank you for your purchase! You now have access to the project source code."
    );
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The project you are looking for does not exist."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/#projects"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                {project.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </a>
              )}

              {/* Conditional Buy/Code Button */}
              {project.isPaid ? (
                <button
                  onClick={handleBuyClick}
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now - {project.currency} {project.price}
                </button>
              ) : (
                project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors duration-200"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </a>
                )
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={
                  project.screenshots[0]?.url ||
                  "https://images.pexels.com/photos/34577/pexels-photo.jpg"
                }
                alt={project.screenshots[0]?.alt || project.title}
                className="w-full h-64 md:h-80 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://images.pexels.com/photos/34577/pexels-photo.jpg";
                }}
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Project Overview
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  {project.description}
                </p>
                {project.longDesc && (
                  <div>
                    {project.longDesc.split("\n\n").map((paragraph, index) => (
                      <p
                        key={`${project.id}-para-${index}`}
                        className="text-gray-600 leading-relaxed mb-4"
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Screenshots */}
            {project.screenshots.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Screenshots
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.screenshots.slice(1).map((screenshot, index) => (
                    <div
                      key={screenshot.id}
                      className="rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={screenshot.url}
                        alt={screenshot.alt || `Screenshot ${index + 2}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.pexels.com/photos/34577/pexels-photo.jpg";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-gray-500 mt-0.5">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${(() => {
                      switch (project.status) {
                        case "PUBLISHED":
                          return "bg-green-100 text-green-800";
                        case "DRAFT":
                          return "bg-yellow-100 text-yellow-800";
                        default:
                          return "bg-gray-100 text-gray-800";
                      }
                    })()}`}
                  >
                    {project.status.toLowerCase()}
                  </span>
                </div>
                {project.isPaid && (
                  <div className="flex items-start text-sm">
                    <span className="text-gray-500 mt-0.5">Type:</span>
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      Premium
                    </span>
                  </div>
                )}
                <div className="flex items-start text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Technologies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-2">Like this project?</h3>
              <p className="text-primary-100 mb-4 text-sm">
                Let's discuss how I can help bring your ideas to life.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-200"
              >
                Start a Project
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {project && (
        <PaymentModal
          project={project}
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
