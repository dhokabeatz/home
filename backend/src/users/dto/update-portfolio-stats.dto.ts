import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsInt, Min, Max } from "class-validator";

export class UpdatePortfolioStatsDto {
  @ApiProperty({ description: "Years of experience", minimum: 0, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @ApiProperty({
    description: "Client satisfaction percentage",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  clientSatisfaction?: number;
}
