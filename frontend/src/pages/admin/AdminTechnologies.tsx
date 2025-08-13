import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  Tag,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService, type Technology } from "../../services/api";

export default function AdminTechnologies() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTechnologies();
      setTechnologies(response.technologies);
    } catch (error) {
      console.error("Failed to load technologies:", error);
      toast.error("Failed to load technologies");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTech) {
        await apiService.updateTechnology(editingTech.id, formData);
        toast.success("Technology updated successfully");
      } else {
        await apiService.createTechnology(formData);
        toast.success("Technology created successfully");
      }

      resetForm();
      loadTechnologies();
    } catch (error) {
      console.error("Failed to save technology:", error);
      toast.error(`Failed to ${editingTech ? "update" : "create"} technology`);
    }
  };

  const handleEdit = (tech: Technology) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      isActive: tech.isActive,
      order: tech.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await apiService.deleteTechnology(id);
      toast.success("Technology deleted successfully");
      loadTechnologies();
    } catch (error) {
      console.error("Failed to delete technology:", error);
      toast.error("Failed to delete technology");
    }
  };

  const toggleStatus = async (tech: Technology) => {
    try {
      await apiService.updateTechnology(tech.id, {
        isActive: !tech.isActive,
      });
      toast.success(
        `Technology ${!tech.isActive ? "activated" : "deactivated"}`
      );
      loadTechnologies();
    } catch (error) {
      console.error("Failed to update technology status:", error);
      toast.error("Failed to update technology status");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", isActive: true, order: 0 });
    setEditingTech(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Additional Technologies
          </h1>
          <p className="text-gray-600">
            Manage the technologies displayed in the skills section
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Technology</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingTech ? "Edit Technology" : "Add New Technology"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="tech-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Technology Name *
                </label>
                <input
                  type="text"
                  id="tech-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., React, Node.js, Docker"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tech-order"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Order
                </label>
                <input
                  type="number"
                  id="tech-order"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active (visible on website)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingTech ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Technologies List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {technologies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No technologies yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first technology.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Add Your First Technology
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {technologies.map((tech) => (
              <div
                key={tech.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${tech.isActive ? "bg-green-100" : "bg-gray-100"}`}
                  >
                    <Tag
                      className={`h-4 w-4 ${tech.isActive ? "text-green-600" : "text-gray-400"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{tech.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>Order: {tech.order}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tech.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tech.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleStatus(tech)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      tech.isActive
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      tech.isActive ? "Hide from website" : "Show on website"
                    }
                  >
                    {tech.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(tech)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tech.id, tech.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Additional Technologies
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              These technologies appear as tags in the "Additional Technologies"
              section of your skills page. They are displayed in the order you
              specify and only active technologies are visible to website
              visitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
