import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('signature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate presigned URL for S3 upload' })
  @ApiResponse({ status: 201, description: 'Upload presigned URL generated successfully' })
  async generateUploadSignature(@Body() dto: GeneratePresignedUrlDto) {
    try {
      const result = await this.uploadService.generateUploadSignature(dto);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('direct')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Direct upload to S3' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    try {
      const result = await this.uploadService.uploadFile(file, folder);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm successful S3 upload' })
  @ApiResponse({ status: 200, description: 'Upload confirmed successfully' })
  async confirmUpload(@Body() body: { publicId: string; url: string }) {
    // Here you could add logic to track uploaded files, validate, etc.
    // For S3, we can verify the file exists by checking the key
    try {
      return {
        success: true,
        message: 'Upload confirmed successfully',
        publicId: body.publicId,
        url: body.url,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
