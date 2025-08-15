import { IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

// SQLite compatibility - using string constants instead of enums
const ContactStatus = {
  UNREAD: "UNREAD",
  READ: "READ",
  ARCHIVED: "ARCHIVED",
} as const;

type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

export class ContactQueryDto {
  @ApiPropertyOptional({
    example: "John Doe",
    description: "Search contacts by name or email",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContactStatus, example: ContactStatus.UNREAD })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({
    example: 1,
    description: "Page number for pagination",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: "Number of items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
