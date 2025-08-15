import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePresignedUrlDto {
  @ApiProperty({
    description: 'Original filename',
    example: 'project-screenshot.jpg',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'Content type of the file',
    example: 'image/jpeg',
  })
  @IsString()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'])
  contentType: string;

  @ApiProperty({
    description: 'Folder to upload to (organized into subfolders automatically)',
    example: 'projects',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['projects', 'uploads', 'media', 'avatars', 'documents', 'portfolio'])
  folder?: string;
}
