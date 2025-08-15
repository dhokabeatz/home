import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSkillDto {
  @ApiProperty({ example: "React" })
  @IsString()
  name: string;

  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({ example: "Frontend" })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: "#3B82F6" })
  @IsOptional()
  @IsString()
  color?: string = "#3B82F6";

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
