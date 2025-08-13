import { Outlet } from "react-router-dom";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { useUserProfile } from "../../hooks/useUserProfile";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout() {
  const { siteSettings } = useSiteSettings();
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer siteSettings={siteSettings} userProfile={profile} />
    </div>
  );
}
