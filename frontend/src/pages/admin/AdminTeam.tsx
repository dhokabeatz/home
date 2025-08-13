import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  apiService,
  type TeamMember,
  type CreateTeamMemberData,
  type UpdateTeamMemberData,
} from "../../services/api";

export default function AdminTeam() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Load team members from API
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const response = await apiService.getTeamMembers({ isActive: true });
        setTeamMembers(response.teamMembers);
      } catch (error) {
        console.error("Failed to load team members:", error);
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await apiService.deleteTeamMember(id);
        setTeamMembers(teamMembers.filter((m) => m.id !== id));
        toast.success("Team member removed successfully");
      } catch (error) {
        console.error("Failed to delete team member:", error);
        toast.error("Failed to delete team member");
      }
    }
  };

  const handleCreateMember = async (data: CreateTeamMemberData) => {
    try {
      const newMember = await apiService.createTeamMember(data);
      setTeamMembers([...teamMembers, newMember]);
      toast.success("Team member created successfully");
    } catch (error) {
      console.error("Failed to create team member:", error);
      toast.error("Failed to create team member");
      throw error;
    }
  };

  const handleUpdateMember = async (data: UpdateTeamMemberData) => {
    if (!editingMember) return;

    try {
      const updatedMember = await apiService.updateTeamMember(
        editingMember.id,
        data
      );
      setTeamMembers(
        teamMembers.map((m) => (m.id === editingMember.id ? updatedMember : m))
      );
      toast.success("Team member updated successfully");
    } catch (error) {
      console.error("Failed to update team member:", error);
      toast.error("Failed to update team member");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage your team members and their profiles
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Team Members
          </h2>

          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No team members yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start building your team by adding the first member
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Your First Team Member
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <TeamMemberModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateMember}
        />
      )}

      {editingMember && (
        <TeamMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleUpdateMember}
        />
      )}
    </div>
  );
}

// Team Member Modal Component
interface TeamMemberModalProps {
  member?: TeamMember | null;
  onClose: () => void;
  onSave: (data: CreateTeamMemberData) => Promise<void>;
}

const TeamMemberModal = ({ member, onClose, onSave }: TeamMemberModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamMemberData>({
    defaultValues: member
      ? {
          name: member.name,
          role: member.role,
          bio: member.bio,
          image: member.image,
          email: member.email,
          linkedin: member.linkedin || "",
          github: member.github || "",
          isActive: member.isActive,
          order: member.order,
        }
      : {
          name: "",
          role: "",
          bio: "",
          image: "",
          email: "",
          linkedin: "",
          github: "",
          isActive: true,
          order: 0,
        },
  });

  const onSubmit = async (data: CreateTeamMemberData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Failed to save team member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract button label to avoid nested ternary
  let buttonLabel = "Create";
  if (isSubmitting) {
    buttonLabel = "Saving...";
  } else if (member) {
    buttonLabel = "Update";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {member ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter team member name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role *
              </label>
              <input
                {...register("role", { required: "Role is required" })}
                id="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. Frontend Developer"
              />
              {errors.role && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bio *
              </label>
              <textarea
                {...register("bio", { required: "Bio is required" })}
                id="bio"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description about the team member"
              />
              {errors.bio && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URL *
              </label>
              <input
                {...register("image", { required: "Image URL is required" })}
                id="image"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.image.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {buttonLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Team Member Modal Component
