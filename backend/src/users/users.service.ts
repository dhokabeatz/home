import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UploadService } from "../upload/upload.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) { }

  async updateProfile(userId: string, updateUserProfileDto: any) {
    try {
      console.log("Starting profile update for user:", userId);
      console.log("Update data received:", updateUserProfileDto);

      // Handle both frontend formats (name) and direct field updates
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        name,
        firstName,
        lastName,
        location,
        phone,
        bio: _,
        website: __,
      } = updateUserProfileDto;

      // If name is provided, split it into firstName and lastName
      let updatedFirstName = firstName;
      let updatedLastName = lastName;

      if (name && typeof name === "string") {
        const nameParts = name.trim().split(" ");
        updatedFirstName = nameParts[0] || "";
        updatedLastName = nameParts.slice(1).join(" ") || "";
      }

      console.log("Processed fields:", {
        firstName: updatedFirstName,
        lastName: updatedLastName,
        location,
        phone,
      });

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(updatedFirstName !== undefined && {
            firstName: updatedFirstName,
          }),
          ...(updatedLastName !== undefined && { lastName: updatedLastName }),
          ...(location !== undefined && { location }),
          ...(phone !== undefined && { phone }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          location: true,
          phone: true,
          avatar: true,
          cvUrl: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("Profile updated successfully:", {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        location: updatedUser.location,
        phone: updatedUser.phone,
      });

      // Return in the format the frontend expects
      const result = {
        ...updatedUser,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
      };

      return result;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  }

  async uploadAboutContent(
    userId: string,
    contentType: string,
    file: Express.Multer.File,
  ) {
    try {
      // Read content from file
      const content = file.buffer.toString("utf-8");

      // Get user settings or create if not exist
      let userSettings = await this.prisma.userSettings.findUnique({
        where: { userId },
      });

      if (!userSettings) {
        userSettings = await this.prisma.userSettings.create({
          data: { userId },
        });
      }

      // Update the specific content field
      const updateData: any = {};
      switch (contentType) {
        case "heading":
          updateData.aboutHeading = content;
          break;
        case "subtitle":
          updateData.aboutSubtitle = content;
          break;
        case "paragraph1":
          updateData.aboutParagraph1 = content;
          break;
        case "paragraph2":
          updateData.aboutParagraph2 = content;
          break;
        default:
          throw new BadRequestException("Invalid content type");
      }

      await this.prisma.userSettings.update({
        where: { userId },
        data: updateData,
      });

      return {
        success: true,
        message: `About ${contentType} updated successfully`,
        content: content,
      };
    } catch (error) {
      throw new BadRequestException(
        "Failed to update about content: " + error.message,
      );
    }
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Get user with password for verification
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Import bcrypt dynamically
    const bcrypt = await import("bcryptjs");

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  async uploadCV(userId: string, file: Express.Multer.File) {
    try {
      // Get user to check if they have an existing CV
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { cvUrl: true },
      });

      // Delete old CV from S3 if exists
      if (user?.cvUrl) {
        const publicId = this.extractPublicIdFromUrl(user.cvUrl);
        if (publicId) {
          try {
            await this.uploadService.deleteFile(publicId);
          } catch (error) {
            console.warn("Failed to delete old CV from S3:", error);
          }
        }
      }

      // Upload new CV to S3
      const uploadResult = await this.uploadService.uploadFile(file, "cv");

      // Update user with new CV URL from S3
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { cvUrl: uploadResult.secureUrl },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          location: true,
          phone: true,
          avatar: true,
          cvUrl: true,
          aboutImage: true,
        },
      });

      // Return user profile in the format expected by frontend
      const userProfile = {
        ...updatedUser,
        name:
          updatedUser.firstName && updatedUser.lastName
            ? `${updatedUser.firstName} ${updatedUser.lastName}`.trim()
            : updatedUser.firstName || updatedUser.lastName || "",
      };

      return {
        user: userProfile,
        uploadResult: {
          success: true,
          cvUrl: updatedUser.cvUrl,
          message: "CV uploaded successfully",
        },
      };
    } catch (error) {
      throw new BadRequestException("Failed to upload CV: " + error.message);
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    try {
      console.log("Starting avatar upload for user:", userId);
      console.log("File details:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      // Get user to check if they have an existing avatar
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      console.log("Current user avatar:", user?.avatar || "none");

      // Delete old avatar from S3 if exists
      if (user?.avatar) {
        const publicId = this.extractPublicIdFromUrl(user.avatar);
        if (publicId) {
          try {
            console.log("Deleting old avatar from S3:", publicId);
            await this.uploadService.deleteFile(publicId);
          } catch (error) {
            console.warn("Failed to delete old avatar from S3:", error);
          }
        }
      }

      // Upload new avatar to S3
      console.log("Uploading new avatar to S3...");
      const uploadResult = await this.uploadService.uploadFile(file, "avatars");
      console.log("S3 upload successful:", uploadResult.secureUrl);

      // Update user with new avatar URL from S3
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: uploadResult.secureUrl },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          location: true,
          phone: true,
          avatar: true,
          cvUrl: true,
          aboutImage: true,
        },
      });

      console.log("User updated successfully:", updatedUser.avatar);

      // Return user profile in the format expected by frontend
      const userProfile = {
        ...updatedUser,
        name:
          updatedUser.firstName && updatedUser.lastName
            ? `${updatedUser.firstName} ${updatedUser.lastName}`.trim()
            : updatedUser.firstName || updatedUser.lastName || "",
      };

      return {
        user: userProfile,
        uploadResult: {
          success: true,
          avatarUrl: updatedUser.avatar,
          message: "Avatar uploaded successfully",
        },
      };
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw new BadRequestException(
        "Failed to upload avatar: " + error.message,
      );
    }
  }

  async uploadAboutImage(userId: string, file: Express.Multer.File) {
    try {
      // Get user to check if they have an existing about image
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { aboutImage: true },
      });

      // Delete old about image from S3 if exists
      if (user?.aboutImage) {
        const publicId = this.extractPublicIdFromUrl(user.aboutImage);
        if (publicId) {
          try {
            await this.uploadService.deleteFile(publicId);
          } catch (error) {
            console.warn("Failed to delete old about image from S3:", error);
          }
        }
      }

      // Upload new image to S3
      const uploadResult = await this.uploadService.uploadFile(file, "about");

      // Update user with new about image URL from S3
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { aboutImage: uploadResult.secureUrl },
        select: {
          id: true,
          aboutImage: true,
        },
      });

      return {
        success: true,
        aboutImageUrl: updatedUser.aboutImage,
        message: "About image uploaded successfully",
      };
    } catch (error) {
      throw new BadRequestException(
        "Failed to upload about image: " + error.message,
      );
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        location: true,
        phone: true,
        avatar: true,
        cvUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    // Return in the format the frontend expects
    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUser(userId: string, updateData: any) {
    const { firstName, lastName, role, isActive } = updateData;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getPortfolioStats() {
    // Get real statistics from the database
    const [totalUsers, totalProjects, totalContacts, totalVisits] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.project.count(),
        this.prisma.contact.count(),
        this.prisma.visitEvent.count(),
      ]);

    return {
      totalUsers,
      totalProjects,
      totalContacts,
      totalVisits: totalVisits,
      yearsExperience: 5,
      clientSatisfaction: 95,
      projectsCompleted: totalProjects,
    };
  }

  async getAboutContent() {
    // Get the admin user's about image and settings
    const adminUser = await this.prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        aboutImage: true,
        settings: {
          select: {
            aboutHeading: true,
            aboutSubtitle: true,
            aboutParagraph1: true,
            aboutParagraph2: true,
          },
        },
      },
    });

    const settings = adminUser?.settings;

    return {
      imageUrl: adminUser?.aboutImage || null,
      content: {
        heading: settings?.aboutHeading || "About Me",
        subtitle: settings?.aboutSubtitle || "Full Stack Developer",
        paragraph1:
          settings?.aboutParagraph1 ||
          "Welcome to my portfolio. I am a passionate developer with years of experience.",
        paragraph2:
          settings?.aboutParagraph2 ||
          "I create amazing web applications using modern technologies and best practices.",
        image: adminUser?.aboutImage || null,
      },
    };
  }

  async getUserSettings(userId: string) {
    let userSettings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // If no settings exist, create default settings
    if (!userSettings) {
      userSettings = await this.prisma.userSettings.create({
        data: {
          userId,
          // Default values will be used from the Prisma schema
        },
      });
    }

    return userSettings;
  }

  async updateUserSettings(userId: string, updateUserSettingsDto: any) {
    // Ensure user settings exist
    await this.getUserSettings(userId);

    return this.prisma.userSettings.update({
      where: { userId },
      data: updateUserSettingsDto,
    });
  }

  async getSiteSettings() {
    // Get the admin user's settings for site-wide configuration
    const adminUser = await this.prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        settings: {
          select: {
            seoTitle: true,
            seoDescription: true,
            githubUrl: true,
            linkedinUrl: true,
            twitterUrl: true,
            emailUrl: true,
            analyticsEnabled: true,
            contactFormEnabled: true,
          },
        },
      },
    });

    const settings = adminUser?.settings;

    return {
      seoTitle: settings?.seoTitle || "Henry Agyemang - Full Stack Developer",
      seoDescription:
        settings?.seoDescription ||
        "Experienced full-stack developer specializing in React, Node.js, and cloud solutions.",
      githubUrl: settings?.githubUrl || null,
      linkedinUrl: settings?.linkedinUrl || null,
      twitterUrl: settings?.twitterUrl || null,
      emailUrl: settings?.emailUrl || null,
      analyticsEnabled: settings?.analyticsEnabled ?? true,
      contactFormEnabled: settings?.contactFormEnabled ?? true,
    };
  }

  async getPublicProfile() {
    // Get the admin user's public profile information
    const adminUser = await this.prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        avatar: true,
        cvUrl: true,
        createdAt: true,
        updatedAt: true,
        settings: {
          select: {
            emailUrl: true,
            githubUrl: true,
            linkedinUrl: true,
            twitterUrl: true,
          },
        },
      },
    });

    if (!adminUser) {
      // Return default profile if no admin user exists
      return {
        id: "default",
        email: "henry@example.com",
        name: "Henry Agyemang",
        phone: null,
        location: null,
        avatar: null,
        cvUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          emailUrl: null,
          githubUrl: null,
          linkedinUrl: null,
          twitterUrl: null,
        },
      };
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
      phone: adminUser.phone,
      location: adminUser.location,
      avatar: adminUser.avatar,
      cvUrl: adminUser.cvUrl,
      createdAt: adminUser.createdAt.toISOString(),
      updatedAt: adminUser.updatedAt.toISOString(),
      settings: adminUser.settings,
    };
  }

  // Placeholder method that was being called
  private extractPublicIdFromUrl(url: string): string | null {
    // Simple extraction logic
    const regex = /\/([^/]+)\.[^.]+$/;
    const match = regex.exec(url);
    return match ? match[1] : null;
  }
}
