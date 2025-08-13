import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Mail, Eye, TrendingUp, Clock, Globe } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiService, Project } from "../../services/api";
import { DashboardSkeleton } from "../../components/ui/Skeleton";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects for statistics
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects({ limit: 100 }); // Get all projects for stats
      setProjects(response.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Calculate real statistics from projects data
  const publishedProjects = projects.filter((p) => p.status === "PUBLISHED");
  const draftProjects = projects.filter((p) => p.status === "DRAFT");
  const archivedProjects = projects.filter((p) => p.status === "ARCHIVED");
  const paidProjects = projects.filter((p) => p.isPaid);

  const stats = [
    {
      name: "Total Projects",
      value: projects.length.toString(),
      change: `${publishedProjects.length} published`,
      icon: FolderOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Published",
      value: publishedProjects.length.toString(),
      change: `${draftProjects.length} drafts`,
      icon: Globe,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Premium Projects",
      value: paidProjects.length.toString(),
      change: `${projects.length - paidProjects.length} free`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      name: "Archived",
      value: archivedProjects.length.toString(),
      change: `${((archivedProjects.length / projects.length) * 100 || 0).toFixed(1)}%`,
      icon: Eye,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  // Mock data for charts (you can replace with real analytics later)
  const visitorData = [
    { name: "Jan", visitors: 4000, pageViews: 2400 },
    { name: "Feb", visitors: 3000, pageViews: 1398 },
    { name: "Mar", visitors: 2000, pageViews: 9800 },
    { name: "Apr", visitors: 2780, pageViews: 3908 },
    { name: "May", visitors: 1890, pageViews: 4800 },
    { name: "Jun", visitors: 2390, pageViews: 3800 },
    { name: "Jul", visitors: 3490, pageViews: 4300 },
  ];

  const projectStatusData = [
    { name: "Published", value: publishedProjects.length, color: "#10B981" },
    { name: "Draft", value: draftProjects.length, color: "#F59E0B" },
    { name: "Archived", value: archivedProjects.length, color: "#6B7280" },
  ];

  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your portfolio.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">
                  {stat.change}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Visitor Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={visitorData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectStatusData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {projectStatusData.map((status) => (
              <div
                key={status.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{status.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {status.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recently Updated Projects
        </h3>
        <div className="space-y-4">
          {recentProjects.length > 0 ? (
            recentProjects.map((project, index) => (
              <div key={project.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{project.title}</p>
                  <p className="text-xs text-gray-500">
                    Updated {new Date(project.updatedAt).toLocaleDateString()} •
                    {(() => {
                      let statusClass = "";
                      if (project.status === "PUBLISHED") {
                        statusClass = "bg-green-100 text-green-800";
                      } else if (project.status === "DRAFT") {
                        statusClass = "bg-yellow-100 text-yellow-800";
                      } else {
                        statusClass = "bg-gray-100 text-gray-800";
                      }
                      return (
                        <span
                          className={`ml-1 px-2 py-0.5 rounded text-xs ${statusClass}`}
                        >
                          {project.status.toLowerCase()}
                        </span>
                      );
                    })()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No projects found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <Globe className="h-8 w-8 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Site Performance</h2>
          <p className="text-blue-100 text-sm mb-4">
            Your site is running smoothly with 99.9% uptime
          </p>
          <button
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            aria-label="View site performance details"
          >
            View Details
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <FolderOpen className="h-8 w-8 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Projects</h2>
          <p className="text-green-100 text-sm mb-4">
            Manage your portfolio projects and showcase
          </p>
          <button
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            aria-label="Add new project"
          >
            Add Project
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <Mail className="h-8 w-8 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Messages</h2>
          <p className="text-purple-100 text-sm mb-4">
            You have 5 unread messages from clients
          </p>
          <button
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            aria-label="View new messages"
          >
            View Messages
          </button>
        </motion.div>
      </div>
    </div>
  );
}
