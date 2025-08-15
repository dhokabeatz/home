import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ description: "User name" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: "User bio" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: "User location" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({ description: "User phone number" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: "User website URL" })
  @ValidateIf((o) => o.website && o.website.trim() !== "")
  @IsUrl({}, { message: "website must be a valid URL address" })
  website?: string;

  @ApiPropertyOptional({ description: "User avatar URL" })
  @ValidateIf((o) => o.avatar && o.avatar.trim() !== "")
  @IsUrl({}, { message: "avatar must be a valid URL address" })
  avatar?: string;

  @ApiPropertyOptional({ description: "User CV URL" })
  @ValidateIf((o) => o.cvUrl && o.cvUrl.trim() !== "")
  @IsUrl({}, { message: "cvUrl must be a valid URL address" })
  cvUrl?: string;
}
