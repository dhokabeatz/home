import { IsString, IsOptional, IsBoolean, IsArray, IsUrl, IsInt, Min, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Custom transformer to convert empty strings to undefined
const EmptyStringToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

class ScreenshotDto {
  @ApiProperty({ example: 'https://example.com/screenshot.jpg' })
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'Project homepage screenshot' })
  @IsOptional()
  @IsString()
  alt?: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'E-Commerce Platform' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Modern e-commerce solution built with React and Node.js' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Detailed description of the project...' })
  @IsOptional()
  @IsString()
  longDesc?: string;

  @ApiPropertyOptional({ description: 'Demo URL (optional)' })
  @IsOptional()
  @IsUrl({}, { message: 'demoUrl must be a valid URL address' })
  @EmptyStringToUndefined()
  demoUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/user/project' })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'githubUrl must be a valid URL address' })
  @EmptyStringToUndefined()
  githubUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean = false;

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @IsIn(['NGN', 'USD', 'GHS', 'ZAR', 'KES'])
  currency?: string = 'NGN';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;

  @ApiProperty({ example: ['React', 'Node.js', 'PostgreSQL'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ type: [ScreenshotDto] })
  @IsOptional()
  @IsArray()
  screenshots?: ScreenshotDto[];
}