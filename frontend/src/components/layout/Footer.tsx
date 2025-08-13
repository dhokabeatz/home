import { Code2, Github, Linkedin, Mail, Twitter, Phone } from "lucide-react";
import { SiteSettings, UserProfile } from "../../services/api";

interface FooterProps {
  siteSettings?: SiteSettings | null;
  userProfile?: UserProfile | null;
}

export default function Footer({ siteSettings, userProfile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Use email from userProfile if available, otherwise fall back to siteSettings
  const contactEmail =
    userProfile?.email ||
    siteSettings?.emailUrl?.replace("mailto:", "") ||
    "henry@example.com";
  const contactPhone = userProfile?.phone;

  // Build social links dynamically from site settings
  const socialLinks = [
    ...(siteSettings?.githubUrl
      ? [
          {
            icon: Github,
            href: siteSettings.githubUrl,
            label: "GitHub",
          },
        ]
      : []),
    ...(siteSettings?.linkedinUrl
      ? [
          {
            icon: Linkedin,
            href: siteSettings.linkedinUrl,
            label: "LinkedIn",
          },
        ]
      : []),
    ...(siteSettings?.twitterUrl
      ? [
          {
            icon: Twitter,
            href: siteSettings.twitterUrl,
            label: "Twitter",
          },
        ]
      : []),
    ...(siteSettings?.emailUrl
      ? [
          {
            icon: Mail,
            href: siteSettings.emailUrl.startsWith("mailto:")
              ? siteSettings.emailUrl
              : `mailto:${siteSettings.emailUrl}`,
            label: "Email",
          },
        ]
      : []),
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold font-heading">Ing. Henry</span>
            </div>
            <p className="text-gray-400">
              Full-stack developer passionate about creating innovative
              solutions and exceptional user experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Projects", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get In Touch</h3>
            <div className="space-y-3 text-gray-400">
              <p>Ready to collaborate on your next project?</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Let's Talk
                  </a>
                )}
              </div>
              {contactPhone && (
                <p className="text-sm text-gray-500">Call: {contactPhone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Ing. Henry Agyemang. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
