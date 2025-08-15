import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a new notification" })
  @ApiResponse({
    status: 201,
    description: "Notification created successfully",
  })
  @ApiBearerAuth()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationsService.create({
      ...createNotificationDto,
      userId: req.user.id,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user notifications" })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  @ApiBearerAuth()
  findAll(
    @Req() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("unreadOnly") unreadOnly?: string,
    @Query("type") type?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const unreadOnlyBool = unreadOnly === "true";

    return this.notificationsService.findAll(req.user.id, {
      page: pageNum,
      limit: limitNum,
      unreadOnly: unreadOnlyBool,
      type,
    });
  }

  @Get("unread-count")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get unread notification count" })
  @ApiResponse({
    status: 200,
    description: "Unread count retrieved successfully",
  })
  @ApiBearerAuth()
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(":id/read")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  @ApiBearerAuth()
  markAsRead(@Param("id") id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch("mark-all-read")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  @ApiBearerAuth()
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get notification by ID" })
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
  })
  @ApiBearerAuth()
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update notification" })
  @ApiResponse({
    status: 200,
    description: "Notification updated successfully",
  })
  @ApiBearerAuth()
  update(
    @Param("id") id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationsService.update(
      id,
      updateNotificationDto,
      req.user.id,
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete notification" })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiBearerAuth()
  remove(@Param("id") id: string, @Req() req: any) {
    return this.notificationsService.remove(id, req.user.id);
  }

  @Delete("bulk")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete multiple notifications" })
  @ApiResponse({
    status: 200,
    description: "Notifications deleted successfully",
  })
  @ApiBearerAuth()
  removeBulk(@Body("ids") ids: string[], @Req() req: any) {
    return this.notificationsService.removeBulk(ids, req.user.id);
  }
}
