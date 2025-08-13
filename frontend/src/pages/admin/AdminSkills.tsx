import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { apiService, type Skill } from "../../services/api";

export default function AdminSkills() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Load skills from API
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await apiService.getSkills({
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          isActive: true,
        });
        setSkills(response.skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
        toast.error("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [categoryFilter]);

  const categories = [
    "all",
    "Frontend",
    "Backend",
    "Language",
    "Database",
    "DevOps",
  ];

  const colorOptions = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-teal-500",
  ];

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      try {
        await apiService.deleteSkill(id);
        setSkills(skills.filter((s) => s.id !== id));
        toast.success("Skill deleted successfully");
      } catch (error) {
        console.error("Failed to delete skill:", error);
        toast.error("Failed to delete skill");
      }
    }
  };

  const toggleStatus = async (skill: Skill) => {
    try {
      const updatedSkill = await apiService.updateSkill(skill.id, {
        isActive: !skill.isActive,
      });
      setSkills(skills.map((s) => (s.id === skill.id ? updatedSkill : s)));
      toast.success("Skill status updated");
    } catch (error) {
      console.error("Failed to update skill status:", error);
      toast.error("Failed to update skill status");
    }
  };

  const filteredSkills = skills;

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Form handling for create/edit
  const [formData, setFormData] = useState({
    name: "",
    percentage: 50,
    category: "Frontend",
    color: "bg-blue-500",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSkill) {
        // Update existing skill
        const updatedSkill = await apiService.updateSkill(
          editingSkill.id,
          formData
        );
        setSkills(
          skills.map((s) => (s.id === editingSkill.id ? updatedSkill : s))
        );
        toast.success("Skill updated successfully");
        setEditingSkill(null);
      } else {
        // Create new skill
        const newSkill = await apiService.createSkill(formData);
        setSkills([...skills, newSkill]);
        toast.success("Skill created successfully");
        setIsCreateModalOpen(false);
      }

      // Reset form
      setFormData({
        name: "",
        percentage: 50,
        category: "Frontend",
        color: "bg-blue-500",
        isActive: true,
      });
    } catch (error) {
      console.error("Failed to save skill:", error);
      toast.error("Failed to save skill");
    }
  };

  const openEditModal = (skill: Skill) => {
    setFormData({
      name: skill.name,
      percentage: skill.percentage,
      category: skill.category,
      color: skill.color,
      isActive: skill.isActive,
    });
    setEditingSkill(skill);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingSkill(null);
    setFormData({
      name: "",
      percentage: 50,
      category: "Frontend",
      color: "bg-blue-500",
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-600">
            Manage your technical skills and proficiency levels
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === category
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category === "all" ? "All Categories" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSkills
          .sort((a, b) => a.order - b.order)
          .map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-md transition-all duration-300 ${
                skill.isActive ? "hover:shadow-lg" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${skill.color} rounded-full`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {skill.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {skill.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xl font-bold ${getPercentageColor(skill.percentage)}`}
                  >
                    {skill.percentage}%
                  </span>
                  <button
                    onClick={() => toggleStatus(skill)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {skill.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: skill.isActive ? `${skill.percentage}%` : "0%",
                    }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-3 rounded-full ${skill.color} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Order: {skill.order}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {skills.filter((s) => s.isActive).length}
          </h3>
          <p className="text-sm text-gray-600">Active Skills</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 font-bold">AVG</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {Math.round(
              skills
                .filter((s) => s.isActive)
                .reduce((acc, skill) => acc + skill.percentage, 0) /
                skills.filter((s) => s.isActive).length
            )}
            %
          </h3>
          <p className="text-sm text-gray-600">Average Proficiency</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-md text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-purple-600 font-bold">TOP</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {Math.max(
              ...skills.filter((s) => s.isActive).map((s) => s.percentage)
            )}
            %
          </h3>
          <p className="text-sm text-gray-600">Highest Skill</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-md text-center"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-orange-600 font-bold">CAT</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {
              new Set(skills.filter((s) => s.isActive).map((s) => s.category))
                .size
            }
          </h3>
          <p className="text-sm text-gray-600">Categories</p>
        </motion.div>
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No skills found
          </h3>
          <p className="text-gray-600 mb-4">
            {categoryFilter === "all"
              ? "Start by adding your first skill"
              : `No skills found in ${categoryFilter} category`}
          </p>
          <button
            onClick={() => {
              setCategoryFilter("all");
              setIsCreateModalOpen(true);
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Skill
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingSkill) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="skillName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Skill Name
                </label>
                <input
                  id="skillName"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="skillPercentage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Proficiency Level ({formData.percentage}%)
                </label>
                <input
                  id="skillPercentage"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentage: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="skillCategory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="skillCategory"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Language">Language</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </legend>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color
                          ? "border-gray-800"
                          : "border-gray-300"
                      } ${color}`}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active (visible on portfolio)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSkill ? "Update" : "Create"} Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
