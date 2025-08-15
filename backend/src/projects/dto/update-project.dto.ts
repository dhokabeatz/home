import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { CreateProjectDto } from "./create-project.dto";

// SQLite compatibility - using string constants instead of enums
const ProjectStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    enum: ProjectStatus,
    example: ProjectStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
