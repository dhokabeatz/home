import {
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserSettingsDto {
  // Notification Settings
  @ApiPropertyOptional({ description: "Enable email notifications" })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: "Enable browser notifications" })
  @IsOptional()
  @IsBoolean()
  browserNotifications?: boolean;

  @ApiPropertyOptional({ description: "Notify on new contact messages" })
  @IsOptional()
  @IsBoolean()
  newContactMessages?: boolean;

  @ApiPropertyOptional({ description: "Notify on project views" })
  @IsOptional()
  @IsBoolean()
  projectViews?: boolean;

  @ApiPropertyOptional({ description: "Send weekly reports" })
  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;

  @ApiPropertyOptional({ description: "Send security alerts" })
  @IsOptional()
  @IsBoolean()
  securityAlerts?: boolean;

  // Security Settings
  @ApiPropertyOptional({ description: "Enable two-factor authentication" })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ description: "Enable login alerts" })
  @IsOptional()
  @IsBoolean()
  loginAlerts?: boolean;

  @ApiPropertyOptional({ description: "Number of active sessions" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  activeSessions?: number;

  // Site Settings
  @ApiPropertyOptional({ description: "Enable maintenance mode" })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ description: "Enable analytics" })
  @IsOptional()
  @IsBoolean()
  analyticsEnabled?: boolean;

  @ApiPropertyOptional({ description: "Enable contact form" })
  @IsOptional()
  @IsBoolean()
  contactFormEnabled?: boolean;

  @ApiPropertyOptional({ description: "SEO title" })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: "SEO description" })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: "GitHub URL" })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiPropertyOptional({ description: "LinkedIn URL" })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: "Twitter URL" })
  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @ApiPropertyOptional({ description: "Email URL" })
  @IsOptional()
  @IsString()
  emailUrl?: string;
}
