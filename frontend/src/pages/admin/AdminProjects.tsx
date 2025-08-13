import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Github,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService, Project, CreateProjectData } from "../../services/api";

interface Screenshot {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    pages: 1,
  });

  const [formData, setFormData] = useState<CreateProjectData>({
    title: "",
    description: "",
    longDesc: "",
    demoUrl: "",
    githubUrl: "",
    status: "DRAFT",
    isPaid: false,
    price: undefined,
    currency: "GHS",
    tags: [],
  });

  useEffect(() => {
    fetchProjects();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setProjects(response.projects || []);
      setPagination({
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 9,
        pages: response.pagination?.pages || 1,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await apiService.deleteProject(id);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setScreenshots([]);
    setFormData({
      title: "",
      description: "",
      longDesc: "",
      demoUrl: "",
      githubUrl: "",
      status: "DRAFT",
      isPaid: false,
      price: undefined,
      currency: "GHS",
      tags: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      longDesc: project.longDesc || "",
      demoUrl: project.demoUrl || "",
      githubUrl: project.githubUrl || "",
      status: project.status,
      isPaid: project.isPaid,
      price: project.price,
      currency: project.currency || "GHS",
      tags: project.tags,
    });

    // Populate screenshots from project screenshots
    if (project.screenshots && project.screenshots.length > 0) {
      const projectScreenshots = project.screenshots
        .sort((a, b) => a.order - b.order)
        .map((screenshot, index) => ({
          id: screenshot.id,
          url: screenshot.url,
          alt: screenshot.alt || `${project.title} screenshot ${index + 1}`,
          order: screenshot.order,
        }));
      setScreenshots(projectScreenshots);
    } else {
      setScreenshots([]);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setScreenshots([]);
    setFormData({
      title: "",
      description: "",
      longDesc: "",
      demoUrl: "",
      githubUrl: "",
      status: "DRAFT",
      isPaid: false,
      price: undefined,
      currency: "GHS",
      tags: [],
    });
  };

  // Screenshot upload handling
  const handleScreenshotUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingScreenshots(true);
    const uploadPromises = Array.from(files).map(async (file, index) => {
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name}: Only image files are supported`);
          return null;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: File size must be less than 10MB`);
          return null;
        }

        toast.loading(`Uploading ${file.name}...`, { id: file.name });

        // Upload to Cloudinary
        const publicUrl = await apiService.uploadImage(file, "projects");

        toast.success(`${file.name} uploaded successfully`, { id: file.name });

        return {
          id: `temp-${Date.now()}-${index}`,
          url: publicUrl,
          alt: `${formData.title || "Project"} screenshot ${screenshots.length + index + 1}`,
          order: screenshots.length + index,
        };
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}`, { id: file.name });
        return null;
      }
    });

    try {
      const uploadedScreenshots = await Promise.all(uploadPromises);
      const validScreenshots = uploadedScreenshots.filter((s) => s !== null);

      if (validScreenshots.length > 0) {
        setScreenshots((prev) => [...prev, ...validScreenshots]);
        toast.success(
          `${validScreenshots.length} screenshot(s) uploaded successfully`
        );
      }
    } catch (error) {
      console.error("Screenshot upload error:", error);
      toast.error("Some screenshots failed to upload");
    }

    setUploadingScreenshots(false);
    event.target.value = ""; // Reset file input
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setFormLoading(true);
    try {
      if (editingProject) {
        // For updates, include all fields including status and screenshots
        const updateData = {
          ...formData,
          screenshots: screenshots.map((screenshot) => ({
            url: screenshot.url,
            alt: screenshot.alt,
            order: screenshot.order,
          })),
        };
        await apiService.updateProject(editingProject.id, updateData);
        toast.success("Project updated successfully");
      } else {
        // For creation, exclude status field as backend sets default to DRAFT
        const { status, ...createData } = formData;
        const createDataWithScreenshots = {
          ...createData,
          screenshots: screenshots.map((screenshot) => ({
            url: screenshot.url,
            alt: screenshot.alt,
            order: screenshot.order,
          })),
        };
        await apiService.createProject(createDataWithScreenshots);
        toast.success("Project created successfully");
      }

      closeModal();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = formData.tags.filter((_, index) => index !== indexToRemove);
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const addTag = (newTag: string) => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const newTag = target.value.trim();
      if (newTag) {
        addTag(newTag);
        target.value = "";
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your portfolio projects</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            id="projects-search"
            name="search"
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            id="projects-status-filter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Project Image */}
            <div className="aspect-video bg-gray-100 relative">
              {project.screenshots && project.screenshots.length > 0 ? (
                <img
                  src={project.screenshots[0].url}
                  alt={project.screenshots[0].alt || project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      📸
                    </div>
                    <p className="text-sm">No screenshot</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 truncate flex-1">
                  {project.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {project.isPaid && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      {project.currency} {project.price}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-gray-400 text-xs">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-3 mb-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-700 flex items-center text-sm"
                  >
                    <Github className="h-4 w-4 mr-1" />
                    Code
                  </a>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(project.createdAt)}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first project.
          </p>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.pages, prev.page + 1),
              }))
            }
            disabled={pagination.page === pagination.pages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="project-title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title *
                    </label>
                    <input
                      id="project-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="project-description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description *
                    </label>
                    <textarea
                      id="project-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Brief project description"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="project-long-desc"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Detailed Description
                    </label>
                    <textarea
                      id="project-long-desc"
                      value={formData.longDesc}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          longDesc: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Detailed project description (optional)"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-demo-url"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Demo URL
                    </label>
                    <input
                      id="project-demo-url"
                      type="url"
                      value={formData.demoUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          demoUrl: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-github-url"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      GitHub URL
                    </label>
                    <input
                      id="project-github-url"
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          githubUrl: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>

                  {editingProject && (
                    <div>
                      <label
                        htmlFor="project-status"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Status
                      </label>
                      <select
                        id="project-status"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPaid}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isPaid: e.target.checked,
                            // Reset price and currency when unchecked
                            price: e.target.checked ? prev.price : undefined,
                            currency: e.target.checked
                              ? prev.currency || "GHS"
                              : undefined,
                          }))
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Paid Project
                      </span>
                    </label>
                  </div>

                  {/* Price and Currency Fields - Only show if paid */}
                  {formData.isPaid && (
                    <>
                      <div>
                        <label
                          htmlFor="project-currency"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Currency
                        </label>
                        <select
                          id="project-currency"
                          value={formData.currency || "GHS"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              currency: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="NGN">NGN (₦) - Nigerian Naira</option>
                          <option value="USD">USD ($) - US Dollars</option>
                          <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
                          <option value="ZAR">
                            ZAR (R) - South African Rand
                          </option>
                          <option value="KES">
                            KES (KSh) - Kenyan Shilling
                          </option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Only currencies supported by Paystack are available
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="project-price"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          id="project-price"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter the price for this premium project
                        </p>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label
                      htmlFor="project-tags"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Technologies
                    </label>

                    {/* Tags Display */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tags Input */}
                    <div className="space-y-2">
                      <input
                        id="project-tags"
                        name="projectTags"
                        type="text"
                        onKeyPress={handleTagKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Type a technology and press Enter or comma to add (e.g., React, Node.js)"
                      />
                      <p className="text-xs text-gray-500">
                        Press Enter or comma (,) to add a tag. Click the × to
                        remove tags.
                      </p>
                    </div>

                    {/* Fallback: Traditional comma-separated input */}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Or use comma-separated input
                      </summary>
                      <div className="mt-2">
                        <input
                          id="project-tags-fallback"
                          name="tagsFallback"
                          type="text"
                          value={formData.tags.join(", ")}
                          onChange={(e) => handleTagsChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          placeholder="React, Node.js, TypeScript..."
                        />
                      </div>
                    </details>
                  </div>

                  {/* Screenshot Upload Section */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="screenshot-upload"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Project Screenshots
                    </label>

                    {/* File Upload Input */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="screenshot-upload"
                          accept="image/*"
                          multiple
                          onChange={handleScreenshotUpload}
                          disabled={uploadingScreenshots}
                          className="hidden"
                        />
                        <label
                          htmlFor="screenshot-upload"
                          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            uploadingScreenshots
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingScreenshots
                            ? "Uploading..."
                            : "Add Screenshots"}
                        </label>
                        <span className="text-sm text-gray-500">
                          (Max 10MB per image, JPG/PNG/GIF)
                        </span>
                      </div>
                    </div>

                    {/* Screenshots Preview */}
                    {screenshots.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {screenshots.map((screenshot, index) => (
                          <div key={screenshot.id} className="relative group">
                            <img
                              src={screenshot.url}
                              alt={screenshot.alt}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded truncate">
                              Screenshot {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  >
                    {formLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    {formLoading ? "Saving..." : "Save Project"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
