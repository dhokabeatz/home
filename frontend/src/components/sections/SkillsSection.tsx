import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiService, type Skill, type Technology } from "../../services/api";

export default function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [techLoading, setTechLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load skills
        const skillsResponse = await apiService.getPublicSkills({
          isActive: true,
        });
        setSkills(skillsResponse.skills);
      } catch (error) {
        console.error("Failed to load skills:", error);
        // Fallback to mock data if API fails
        setSkills([
          {
            id: "1",
            name: "React/Next.js",
            percentage: 95,
            category: "Frontend",
            color: "bg-blue-500",
            isActive: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Node.js/Express",
            percentage: 90,
            category: "Backend",
            color: "bg-green-500",
            isActive: true,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "TypeScript",
            percentage: 88,
            category: "Language",
            color: "bg-blue-600",
            isActive: true,
            order: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "4",
            name: "Python/Django",
            percentage: 85,
            category: "Backend",
            color: "bg-yellow-500",
            isActive: true,
            order: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "5",
            name: "PostgreSQL/MongoDB",
            percentage: 82,
            category: "Database",
            color: "bg-purple-500",
            isActive: true,
            order: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "6",
            name: "AWS/Cloud",
            percentage: 80,
            category: "DevOps",
            color: "bg-orange-500",
            isActive: true,
            order: 6,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }

      try {
        // Load technologies
        const techResponse = await apiService.getTechnologies({
          isActive: true,
        });
        setTechnologies(techResponse.technologies);
      } catch (error) {
        console.error("Failed to load technologies:", error);
        // Fallback to mock data if API fails
        setTechnologies([
          {
            id: "1",
            name: "Git",
            isActive: true,
            order: 1,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            name: "Redis",
            isActive: true,
            order: 2,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "3",
            name: "Elasticsearch",
            isActive: true,
            order: 3,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "4",
            name: "Jenkins",
            isActive: true,
            order: 4,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "5",
            name: "Terraform",
            isActive: true,
            order: 5,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "6",
            name: "Webpack",
            isActive: true,
            order: 6,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "7",
            name: "Jest",
            isActive: true,
            order: 7,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "8",
            name: "Cypress",
            isActive: true,
            order: 8,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "9",
            name: "Figma",
            isActive: true,
            order: 9,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "10",
            name: "Adobe XD",
            isActive: true,
            order: 10,
            createdAt: "",
            updatedAt: "",
          },
        ]);
      } finally {
        setTechLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <section id="skills" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Technical Skills
            </h2>
            <p className="text-lg text-gray-600">Loading skills...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
            Technical Skills
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise and proficiency
            levels across various technologies and frameworks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {skill.name}
                </span>
                <span className="text-primary-600 font-bold">
                  {skill.percentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`h-3 rounded-full ${skill.color} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Additional Technologies
          </h3>

          <div className="flex flex-wrap justify-center gap-3">
            {techLoading
              ? // Loading skeleton for technologies
                [
                  "tech1",
                  "tech2",
                  "tech3",
                  "tech4",
                  "tech5",
                  "tech6",
                  "tech7",
                  "tech8",
                ].map((key) => (
                  <div
                    key={`loading-${key}`}
                    className="px-4 py-2 bg-gray-200 rounded-full text-sm animate-pulse"
                    style={{ width: "80px", height: "32px" }}
                  />
                ))
              : technologies.map((tech, index) => (
                  <motion.span
                    key={tech.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {tech.name}
                  </motion.span>
                ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
