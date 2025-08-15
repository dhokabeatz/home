import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UploadService } from "../upload/upload.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";

// SQLite compatibility - using string constants instead of enums
const ProjectStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // Transform project data for frontend compatibility
  private transformProject(project: any) {
    return {
      ...project,
      tags: project.tags ? JSON.parse(project.tags) : [],
    };
  }

  private transformProjects(projects: any[]) {
    return projects.map((project) => this.transformProject(project));
  }

  async findAll(query: ProjectQueryDto) {
    const { status, search, page = 1, limit = 10, published } = query;

    const where = {
      ...(status && { status: status as ProjectStatus }),
      ...(published && { status: ProjectStatus.PUBLISHED }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          screenshots: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects: this.transformProjects(projects),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        screenshots: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return this.transformProject(project);
  }

  async create(createProjectDto: CreateProjectDto) {
    const { screenshots, tags, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        tags: tags ? JSON.stringify(tags) : null,
        screenshots: {
          create: screenshots?.map((screenshot, index) => ({
            ...screenshot,
            order: index,
          })),
        },
      },
      include: {
        screenshots: true,
      },
    });

    return this.transformProject(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { screenshots, tags, ...projectData } = updateProjectDto;

    // If screenshots are provided, delete old ones from Cloudinary and database
    if (screenshots) {
      // Get existing screenshots before deletion
      const existingProject = await this.prisma.project.findUnique({
        where: { id },
        include: { screenshots: true },
      });

      if (existingProject?.screenshots) {
        // Delete old images from Cloudinary
        for (const screenshot of existingProject.screenshots) {
          try {
            const publicId = this.extractPublicIdFromUrl(screenshot.url);
            if (publicId) {
              await this.uploadService.deleteFile(publicId);
            }
          } catch (error) {
            console.error(
              `Failed to delete old image from Cloudinary: ${screenshot.url}`,
              error,
            );
            // Continue with update even if Cloudinary deletion fails
          }
        }
      }

      // Delete old screenshots from database
      await this.prisma.projectScreenshot.deleteMany({
        where: { projectId: id },
      });
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(screenshots && {
          screenshots: {
            create: screenshots.map((screenshot, index) => ({
              ...screenshot,
              order: index,
            })),
          },
        }),
      },
      include: {
        screenshots: true,
      },
    });

    return this.transformProject(updatedProject);
  }

  async remove(id: string) {
    const project = await this.findOne(id); // This will throw if not found

    // Delete associated images from Cloudinary
    if (project.screenshots && project.screenshots.length > 0) {
      for (const screenshot of project.screenshots) {
        try {
          const publicId = this.extractPublicIdFromUrl(screenshot.url);
          if (publicId) {
            await this.uploadService.deleteFile(publicId);
          }
        } catch (error) {
          console.error(
            `Failed to delete image from Cloudinary: ${screenshot.url}`,
            error,
          );
          // Continue with deletion even if Cloudinary deletion fails
        }
      }
    }

    // Delete the project from database
    return this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Extract Cloudinary public ID from URL
   * Example: https://res.cloudinary.com/portfolio/image/upload/v1234567/portfolio/projects/abc123.jpg
   * Returns: portfolio/projects/abc123
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Match Cloudinary URL pattern and extract public ID
      const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
      const match = regex.exec(url);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error extracting public ID from URL:", url, error);
      return null;
    }
  }
}
