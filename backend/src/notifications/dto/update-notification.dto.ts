import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateNotificationDto } from "./create-notification.dto";
import { IsOptional, IsBoolean, IsDateString } from "class-validator";

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readAt?: string;
}
