import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTeamMemberDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  name: string;

  @ApiProperty({ example: "Senior Developer" })
  @IsString()
  role: string;

  @ApiProperty({
    example:
      "Experienced full-stack developer with expertise in modern web technologies.",
  })
  @IsString()
  bio: string;

  @ApiProperty({ example: "https://example.com/avatar.jpg" })
  @IsString()
  image: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "https://linkedin.com/in/johndoe" })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ example: "https://github.com/johndoe" })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;
}
