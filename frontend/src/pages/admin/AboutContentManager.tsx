import { useState, useEffect, useRef } from "react";
import { Save, Upload, RefreshCw, Image, X } from "lucide-react";
import {
  useAboutContent,
  DEFAULT_ABOUT_CONTENT,
} from "../../hooks/useAboutContent";

export default function AboutContentManager() {
  const {
    content,
    imageUrl,
    loading,
    error,
    refetch,
    uploadContent,
    uploadImage,
    uploading,
    uploadingImage,
  } = useAboutContent();
  const [formData, setFormData] = useState({
    heading: "",
    subtitle: "",
    paragraph1: "",
    paragraph2: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when content loads
  useEffect(() => {
    if (content) {
      setFormData({
        heading: content.heading || DEFAULT_ABOUT_CONTENT.heading || "",
        subtitle: content.subtitle || DEFAULT_ABOUT_CONTENT.subtitle || "",
        paragraph1:
          content.paragraph1 || DEFAULT_ABOUT_CONTENT.paragraph1 || "",
        paragraph2:
          content.paragraph2 || DEFAULT_ABOUT_CONTENT.paragraph2 || "",
      });
    }
  }, [content]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpload = async (
    contentType: "heading" | "subtitle" | "paragraph1" | "paragraph2"
  ) => {
    try {
      const text = formData[contentType];
      if (!text.trim()) {
        alert("Please enter some content before uploading.");
        return;
      }

      await uploadContent(contentType, text);
      setSuccessMessage(`${contentType} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload content. Please try again.");
    }
  };

  const handleUploadAll = async () => {
    try {
      const uploads: Promise<void>[] = [];
      if (formData.heading.trim())
        uploads.push(uploadContent("heading", formData.heading));
      if (formData.subtitle.trim())
        uploads.push(uploadContent("subtitle", formData.subtitle));
      if (formData.paragraph1.trim())
        uploads.push(uploadContent("paragraph1", formData.paragraph1));
      if (formData.paragraph2.trim())
        uploads.push(uploadContent("paragraph2", formData.paragraph2));

      await Promise.all(uploads);
      setSuccessMessage("All content updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Upload all failed:", err);
      alert("Some content failed to upload. Please try again.");
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      await uploadImage(selectedImage);
      setSuccessMessage("About image updated successfully!");
      setSelectedImage(null);
      setImagePreview(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleImageCancel = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          About Content Manager
        </h2>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          About Content Manager
        </h2>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {uploading ? "Uploading..." : "Save All Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 space-y-6">
          {/* Heading */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="heading-input"
                className="block text-sm font-medium text-gray-700"
              >
                Section Heading
              </label>
              <button
                onClick={() => handleUpload("heading")}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50"
              >
                <Upload className="h-3 w-3" />
                Upload
              </button>
            </div>
            <input
              id="heading-input"
              type="text"
              value={formData.heading}
              onChange={(e) => handleInputChange("heading", e.target.value)}
              placeholder="About Me"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="subtitle-input"
                className="block text-sm font-medium text-gray-700"
              >
                Section Subtitle
              </label>
              <button
                onClick={() => handleUpload("subtitle")}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50"
              >
                <Upload className="h-3 w-3" />
                Upload
              </button>
            </div>
            <textarea
              id="subtitle-input"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Brief description or tagline"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Paragraph 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="paragraph1-input"
                className="block text-sm font-medium text-gray-700"
              >
                First Paragraph
              </label>
              <button
                onClick={() => handleUpload("paragraph1")}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50"
              >
                <Upload className="h-3 w-3" />
                Upload
              </button>
            </div>
            <textarea
              id="paragraph1-input"
              value={formData.paragraph1}
              onChange={(e) => handleInputChange("paragraph1", e.target.value)}
              placeholder="First paragraph of your about section"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Paragraph 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="paragraph2-input"
                className="block text-sm font-medium text-gray-700"
              >
                Second Paragraph
              </label>
              <button
                onClick={() => handleUpload("paragraph2")}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50"
              >
                <Upload className="h-3 w-3" />
                Upload
              </button>
            </div>
            <textarea
              id="paragraph2-input"
              value={formData.paragraph2}
              onChange={(e) => handleInputChange("paragraph2", e.target.value)}
              placeholder="Second paragraph of your about section"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* About Image */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="block text-sm font-medium text-gray-700">
                About Section Image
              </div>
              {selectedImage && (
                <div className="flex gap-2">
                  <button
                    onClick={handleImageCancel}
                    disabled={uploadingImage}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Upload className="h-3 w-3" />
                    {uploadingImage ? "Uploading..." : "Upload"}
                  </button>
                </div>
              )}
            </div>

            {/* File Input */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Image className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF or WebP (MAX. 5MB)
                  </p>
                </div>
              </label>
            </div>

            {/* Image Preview */}
            {(imagePreview || imageUrl) && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {imagePreview ? "Selected Image:" : "Current Image:"}
                </p>
                <div className="relative inline-block">
                  <img
                    src={imagePreview || imageUrl || ""}
                    alt="About section preview"
                    className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {imagePreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <span className="text-white text-sm font-medium">
                        Ready to upload
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Content Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Live Content Preview
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {content.heading || DEFAULT_ABOUT_CONTENT.heading}
              </h4>
              <p className="text-gray-600 mt-2">
                {content.subtitle || DEFAULT_ABOUT_CONTENT.subtitle}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-gray-600 leading-relaxed">
                {content.paragraph1 || DEFAULT_ABOUT_CONTENT.paragraph1}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {content.paragraph2 || DEFAULT_ABOUT_CONTENT.paragraph2}
              </p>
            </div>
          </div>
          {imageUrl && (
            <div className="flex justify-center">
              <div className="w-64 h-80 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="About section"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
