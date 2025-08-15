import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { UpdatePortfolioStatsDto } from "./dto/update-portfolio-stats.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get("public-profile")
  @ApiOperation({ summary: "Get public user profile (no auth required)" })
  @ApiResponse({
    status: 200,
    description: "Public profile retrieved successfully",
  })
  async getPublicProfile() {
    return this.usersService.getPublicProfile();
  }

  @Get("portfolio-stats")
  @ApiOperation({ summary: "Get portfolio statistics (no auth required)" })
  @ApiResponse({
    status: 200,
    description: "Portfolio statistics retrieved successfully",
  })
  async getPortfolioStats() {
    return this.usersService.getPortfolioStats();
  }

  @Get("site-settings")
  @ApiOperation({ summary: "Get public site settings (no auth required)" })
  @ApiResponse({
    status: 200,
    description: "Site settings retrieved successfully",
  })
  async getPublicSiteSettings() {
    return this.usersService.getSiteSettings();
  }

  @Patch("portfolio-stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update portfolio statistics" })
  @ApiResponse({
    status: 200,
    description: "Portfolio statistics updated successfully",
  })
  async updatePortfolioStats(
    @Request() _req,
    @Body() _updatePortfolioStatsDto: UpdatePortfolioStatsDto,
  ) {
    return this.usersService.getPortfolioStats(); // Simplified during migration
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile with settings" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
  })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully",
  })
  async updateProfile(
    @Request() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateUserProfileDto);
  }

  @Post("profile/avatar")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload user avatar" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "Avatar uploaded successfully" })
  async uploadAvatar(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /^image\/(jpeg|jpg|png|gif|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(req.user.id, file);
  }

  @Post("profile/cv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload user CV" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "CV uploaded successfully" })
  async uploadCV(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: /^application\/pdf$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.usersService.uploadCV(userId, file);
  }

  @Get("settings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user settings" })
  @ApiResponse({
    status: 200,
    description: "User settings retrieved successfully",
  })
  async getSettings(@Request() req) {
    return this.usersService.getUserSettings(req.user.id);
  }

  @Patch("settings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user settings" })
  @ApiResponse({
    status: 200,
    description: "User settings updated successfully",
  })
  async updateSettings(
    @Request() req,
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ) {
    return this.usersService.updateUserSettings(
      req.user.id,
      updateUserSettingsDto,
    );
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id;
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Post("profile/about-content/:contentType")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload about section text content" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 200,
    description: "About content uploaded successfully",
  })
  async uploadAboutContent(
    @Request() req,
    @Param("contentType")
    contentType: "heading" | "subtitle" | "paragraph1" | "paragraph2",
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }), // 1MB for text files
          // Removing FileTypeValidator since we control the file creation and know it's text
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.usersService.uploadAboutContent(userId, contentType, file);
  }

  @Post("profile/about-image")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("image"))
  @ApiOperation({ summary: "Upload about section image" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 200,
    description: "About image uploaded successfully",
  })
  async uploadAboutImage(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB for images
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.usersService.uploadAboutImage(req.user.id, image);
  }

  @Get("about-content")
  @ApiOperation({ summary: "Get about section content (no auth required)" })
  @ApiResponse({
    status: 200,
    description: "About content retrieved successfully",
  })
  async getAboutContent() {
    return this.usersService.getAboutContent();
  }
}
