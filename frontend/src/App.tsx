import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";
import { AlertProvider } from "./contexts/AlertContext";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/public/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
// Import analytics for global initialization
import "./services/analytics";

// Lazy load admin and less critical components
const ProjectDetail = lazy(() => import("./pages/public/ProjectDetail"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminSkills = lazy(() => import("./pages/admin/AdminSkills"));
const AdminTechnologies = lazy(() => import("./pages/admin/AdminTechnologies"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AboutContentManager = lazy(
  () => import("./pages/admin/AboutContentManager")
);

// Import quick loading component
import QuickLoadingSpinner from "./components/QuickLoadingSpinner";

function App() {
  return (
    <AlertProvider>
      <Suspense fallback={<QuickLoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route
              path="projects/:id"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <ProjectDetail />
                </Suspense>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<QuickLoadingSpinner />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminAnalytics />
                </Suspense>
              }
            />
            <Route
              path="projects"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminProjects />
                </Suspense>
              }
            />
            <Route
              path="services"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminServices />
                </Suspense>
              }
            />
            <Route
              path="skills"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminSkills />
                </Suspense>
              }
            />
            <Route
              path="technologies"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminTechnologies />
                </Suspense>
              }
            />
            <Route
              path="team"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminTeam />
                </Suspense>
              }
            />
            <Route
              path="media"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminMedia />
                </Suspense>
              }
            />
            <Route
              path="contacts"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminContacts />
                </Suspense>
              }
            />
            <Route
              path="about-content"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AboutContentManager />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<QuickLoadingSpinner />}>
                  <AdminSettings />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
        }}
      />
    </AlertProvider>
  );
}
export default App;
