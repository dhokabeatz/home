import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";

// SQLite compatibility - using string constants instead of enums
const NotificationType = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CONTACT: "CONTACT",
  SYSTEM: "SYSTEM",
} as const;

type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

interface NotificationFilters {
  page: number;
  limit: number;
  unreadOnly?: boolean;
  type?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto & { userId: string },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        ...createNotificationDto,
        type: createNotificationDto.type,
      },
    });

    return {
      success: true,
      data: notification,
      message: "Notification created successfully",
    };
  }

  async findAll(userId: string, filters: NotificationFilters) {
    const { page, limit, unreadOnly, type } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    if (type && type !== "all") {
      whereClause.type = type.toUpperCase() as NotificationType;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          actionUrl: true,
          metadata: true,
          createdAt: true,
          readAt: true,
        },
      }),
      this.prisma.notification.count({
        where: whereClause,
      }),
    ]);

    return {
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      success: true,
      data: { count },
    };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return {
      success: true,
      data: notification,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      data: updated,
      message: "Notification marked as read",
    };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      message: "All notifications marked as read",
    };
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId: string,
  ) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });

    return {
      success: true,
      data: updated,
      message: "Notification updated successfully",
    };
  }

  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Notification deleted successfully",
    };
  }

  async removeBulk(ids: string[], userId: string) {
    await this.prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    return {
      success: true,
      message: "Notifications deleted successfully",
    };
  }

  // Helper method to create system notifications
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    actionUrl?: string,
    metadata?: any,
  ) {
    return this.create({
      userId,
      title,
      message,
      type,
      actionUrl,
      metadata,
    });
  }

  // Create notification for new contact submissions
  async createContactNotification(
    userId: string,
    contactName: string,
    contactEmail: string,
  ) {
    return this.createSystemNotification(
      userId,
      "New Contact Message",
      `New message from ${contactName} (${contactEmail})`,
      NotificationType.CONTACT,
      "/admin/contacts",
      { contactName, contactEmail },
    );
  }
}
