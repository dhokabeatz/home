import { IsString, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Web Development' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Building responsive, modern websites and web applications using the latest technologies.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Code' })
  @IsString()
  icon: string;

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
