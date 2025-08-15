import { IsEnum, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

// SQLite compatibility - using string constants instead of enums
const ContactStatus = {
  UNREAD: "UNREAD",
  READ: "READ",
  ARCHIVED: "ARCHIVED",
} as const;

type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

export class UpdateContactDto {
  @ApiPropertyOptional({ enum: ContactStatus, example: ContactStatus.READ })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}
