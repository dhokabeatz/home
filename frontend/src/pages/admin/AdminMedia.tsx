import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  Image,
  FileText,
  Film,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "document" | "video";
  size?: number;
  uploadDate: string;
  category: string;
  projectId?: string;
  projectTitle?: string;
}

export default function AdminMedia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to process screenshots and return MediaFile[]
  function extractMediaFromProject(project: {
    screenshots: any[];
    title: string;
    updatedAt: string;
    id: string;
  }): MediaFile[] {
    if (!project.screenshots || project.screenshots.length === 0) return [];
    return project.screenshots.map(
      (screenshot: { id: string; order: number; url: string }) =>
        ({
          id: screenshot.id,
          name: `${project.title} - Screenshot ${screenshot.order + 1}`,
          url: screenshot.url,
          type: "image",
          uploadDate: project.updatedAt.split("T")[0],
          category: "projects",
          projectId: project.id,
          projectTitle: project.title,
        }) as const
    );
  }

  // Load media files from projects (screenshots)
  useEffect(() => {
    const loadMediaFromProjects = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProjects();
        let mediaFromProjects: MediaFile[] = [];

        // Check if response and data exist
        if (response && response.projects && Array.isArray(response.projects)) {
          response.projects.forEach(
            (project: {
              screenshots: any[];
              title: string;
              updatedAt: string;
              id: string;
            }) => {
              mediaFromProjects = mediaFromProjects.concat(
                extractMediaFromProject(project)
              );
            }
          );
        }

        setMediaFiles(mediaFromProjects);
      } catch (error) {
        console.error("Error loading media:", error);
        toast.error("Failed to load media files");
      } finally {
        setLoading(false);
      }
    };

    loadMediaFromProjects();
  }, []);

  const fileTypes = ["all", "image", "document", "video"];

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || file.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "document":
        return FileText;
      case "video":
        return Film;
      default:
        return FileText;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
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

        // Upload to S3
        const publicUrl = await apiService.uploadImage(file, "media");

        const newFile: MediaFile = {
          id: `upload-${Date.now()}-${Math.random()}`,
          name: file.name,
          url: publicUrl,
          type: "image",
          size: file.size,
          uploadDate: new Date().toISOString().split("T")[0],
          category: "uploads",
        };

        toast.success(`${file.name} uploaded successfully`, { id: file.name });
        return newFile;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}`, { id: file.name });
        return null;
      }
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(
        (file): file is MediaFile => file !== null
      );

      if (validFiles.length > 0) {
        setMediaFiles((prev) => [...validFiles, ...prev]);
        toast.success(`${validFiles.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Batch upload error:", error);
      toast.error("Some files failed to upload");
    }

    // Reset file input
    event.target.value = "";
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      setMediaFiles((prev) => prev.filter((f) => f.id !== id));
      setSelectedFiles((prev) => prev.filter((fId) => fId !== id));
      toast.success("File removed from gallery");
    }
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${selectedFiles.length} file(s)?`
      )
    ) {
      setMediaFiles((prev) =>
        prev.filter((f) => !selectedFiles.includes(f.id))
      );
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} file(s) removed from gallery`);
    }
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f) => f.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Integration Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Media Management Status - S3 Upload Enabled
          </p>
        </div>
        <p className="text-green-700 mt-2">
          ✅ S3 Image Upload: Fully functional with AWS presigned URLs
          <br />
          ✅ Project Screenshots: Loading from backend database
          <br />✅ File Management: Upload, view, and remove files from gallery
        </p>
      </motion.div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">
            Manage your images, documents, and videos
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedFiles.length})
            </button>
          )}

          <label className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
            <input
              id="media-upload"
              name="mediaUpload"
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {mediaFiles.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {mediaFiles.filter((f) => f.type === "image").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {mediaFiles.filter((f) => f.type === "document").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  mediaFiles.reduce((acc, file) => acc + (file.size || 0), 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="media-search"
                name="search"
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                id="media-type-filter"
                name="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {fileTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all"
                      ? "All Types"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={selectAllFiles}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {selectedFiles.length === filteredFiles.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {(() => {
        if (loading) {
          return (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          );
        }
        if (filteredFiles.length === 0) {
          return (
            <div className="text-center py-20">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No media files found
              </h3>
              <p className="text-gray-600 mb-4">
                {mediaFiles.length === 0
                  ? "Create projects with screenshots to see media files here, or implement backend media API for file uploads."
                  : "No files match your current search and filter criteria."}
              </p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredFiles.map((file, index) => {
              const IconComponent = getFileIcon(file.type);
              const isSelected = selectedFiles.includes(file.id);

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary-500" : ""
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="relative">
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <input
                        id={`media-checkbox-${file.id}`}
                        name={`fileSelect-${file.id}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFileSelection(file.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="capitalize">{file.type}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {file.category}
                      </span>

                      <div className="flex items-center space-x-1">
                        {file.type === "image" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, "_blank");
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View"
                            aria-label={`View ${file.name}`}
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implement download logic
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                          aria-label={`Download ${file.name}`}
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                          aria-label={`Delete ${file.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
