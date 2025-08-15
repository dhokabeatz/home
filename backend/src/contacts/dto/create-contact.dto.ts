import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Project Discussion' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'I would like to discuss a project opportunity.' })
  @IsString()
  message: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
