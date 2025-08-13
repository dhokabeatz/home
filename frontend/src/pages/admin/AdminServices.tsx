import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Code,
  Smartphone,
  Cloud,
  Database,
  Palette,
  Zap,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  apiService,
  Service,
  CreateServiceData,
} from "../../services/api";

const iconOptions = {
  Code: Code,
  Smartphone: Smartphone,
  Cloud: Cloud,
  Database: Database,
  Palette: Palette,
  Zap: Zap,
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<CreateServiceData>({
    title: "",
    description: "",
    icon: "Code",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServices();
      setServices(response.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await apiService.deleteService(id);
      setServices(services.filter((s) => s.id !== id));
      toast.success("Service deleted successfully");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      icon: "Code",
      isActive: true,
      order: services.length,
    });
    setEditingService(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      isActive: service.isActive,
      order: service.order,
    });
    setEditingService(service);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      icon: "Code",
      isActive: true,
      order: 0,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        const updatedService = await apiService.updateService(
          editingService.id,
          formData
        );
        setServices(
          services.map((s) => (s.id === editingService.id ? updatedService : s))
        );
        toast.success("Service updated successfully");
      } else {
        const newService = await apiService.createService(formData);
        setServices([...services, newService]);
        toast.success("Service created successfully");
      }
      closeModal();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleInputChange = (field: keyof CreateServiceData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getIcon = (iconName: string) => {
    const IconComponent =
      iconOptions[iconName as keyof typeof iconOptions] || Code;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">
            Manage the services you offer to clients
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services
          .sort((a, b) => a.order - b.order)
          .map((service, index) => {
            const IconComponent = getIcon(service.icon);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 shadow-md transition-all duration-300 ${
                  service.isActive ? "hover:shadow-lg" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      service.isActive ? "bg-primary-100" : "bg-gray-100"
                    }`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${
                        service.isActive ? "text-primary-600" : "text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        service.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Order: {service.order}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Code className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No services yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first service offering
          </p>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Your First Service
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? "Edit Service" : "Create New Service"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="service-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    id="service-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                    placeholder="Web Development"
                  />
                </div>

                <div>
                  <label htmlFor="service-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="service-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                    placeholder="Building responsive, modern websites and web applications using the latest technologies."
                  />
                </div>

                <div>
                  <label htmlFor="service-icon" className="block text-sm font-medium text-gray-700 mb-2">
                    Icon *
                  </label>
                  <select
                    id="service-icon"
                    value={formData.icon}
                    onChange={(e) => handleInputChange("icon", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {Object.keys(iconOptions).map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="service-order"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Order
                    </label>
                    <input
                      id="service-order"
                      type="number"
                      value={formData.order || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "order",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="service-status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                      id="service-status"
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.value === "true")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingService ? "Update Service" : "Create Service"}
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
