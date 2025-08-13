import { useState, useEffect } from "react";
import { apiService, type AboutContent } from "../services/api";

interface UseAboutContentReturn {
  content: AboutContent;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uploadContent: (
    contentType: "heading" | "subtitle" | "paragraph1" | "paragraph2",
    text: string
  ) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  uploading: boolean;
  uploadingImage: boolean;
}

export const useAboutContent = (): UseAboutContentReturn => {
  const [content, setContent] = useState<AboutContent>({
    heading: null,
    subtitle: null,
    paragraph1: null,
    paragraph2: null,
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAboutContent();
      setContent(response.content);
      setImageUrl(response.imageUrl);
    } catch (err) {
      console.error("Error fetching about content:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load about content"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadContent = async (
    contentType: "heading" | "subtitle" | "paragraph1" | "paragraph2",
    text: string
  ) => {
    try {
      setUploading(true);
      setError(null);

      // Create a text file from the string
      const filename = `about-${contentType}.txt`;
      const file = apiService.createTextFile(text, filename);

      // Upload the file
      await apiService.uploadAboutContent(contentType, file);

      // Refetch content to get the updated data
      await fetchContent();
    } catch (err) {
      console.error(`Error uploading ${contentType} content:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to upload ${contentType} content`
      );
      throw err; // Re-throw so calling component can handle it
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      setError(null);

      // Upload the image
      await apiService.uploadAboutImage(file);

      // Refetch content to get the updated data
      await fetchContent();
    } catch (err) {
      console.error("Error uploading about image:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload about image"
      );
      throw err; // Re-throw so calling component can handle it
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    imageUrl,
    loading,
    error,
    refetch: fetchContent,
    uploadContent,
    uploadImage,
    uploading,
    uploadingImage,
  };
};

// Default content fallbacks for when content is not available
export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heading: "About Me",
  subtitle: "Creative Developer & UI/UX Enthusiast",
  paragraph1:
    "I am a passionate developer with experience in creating modern, responsive web applications. My expertise spans across frontend and backend technologies, with a focus on creating exceptional user experiences.",
  paragraph2:
    "When I'm not coding, I enjoy exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community. I believe in writing clean, maintainable code and following best practices.",
};
