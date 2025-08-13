import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Users,
  Image,
  Mail,
  Award,
  Briefcase,
  Code2,
  FileText,
  Tag,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Services", href: "/admin/services", icon: Briefcase },
  { name: "Skills", href: "/admin/skills", icon: Award },
  { name: "Technologies", href: "/admin/technologies", icon: Tag },
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "About Content", href: "/admin/about-content", icon: FileText },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Contacts", href: "/admin/contacts", icon: Mail },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Code2 className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold font-heading text-gray-900">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-3 h-5 w-5",
                    isActive
                      ? "text-primary-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
