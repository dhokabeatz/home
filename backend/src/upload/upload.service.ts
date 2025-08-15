import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GeneratePresignedUrlDto } from "./dto/generate-presigned-url.dto";

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize S3 client configuration
    const s3Config: any = {
      region: this.configService.get("AWS_DEFAULT_REGION") || this.configService.get("AWS_REGION") || "us-east-1",
    };

    // Check for AWS profile first
    const awsProfile = this.configService.get("AWS_PROFILE");
    if (awsProfile) {
      // When using AWS profile, set the profile in the config
      process.env.AWS_PROFILE = awsProfile;
      console.log(`Using AWS profile: ${awsProfile}`);
    }

    // Only add explicit credentials if they are provided
    // Otherwise, AWS SDK will use default profile/IAM role credentials
    const accessKeyId = this.configService.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get("AWS_SECRET_ACCESS_KEY");

    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
      console.log("Using explicit AWS credentials");
    } else {
      console.log("Using AWS profile or default credentials");
    }

    this.s3Client = new S3Client(s3Config);
    this.bucketName = this.configService.get("AWS_S3_BUCKET_NAME");

    console.log(
      `AWS S3 configured with bucket: ${this.bucketName}, region: ${s3Config.region}`,
    );

    if (!this.bucketName) {
      console.error("AWS_S3_BUCKET_NAME not configured!");
    }
  }
  async generateUploadSignature(dto: GeneratePresignedUrlDto): Promise<{
    presignedUrl: string;
    fields: Record<string, string>;
    key: string;
    bucket: string;
    url: string;
  }> {
    const { folder = "portfolio", filename, contentType } = dto;

    // Create organized folder structure
    const folderStructure = this.getFolderStructure(folder);

    // Generate unique file key with proper folder structure
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = this.getFileExtension(filename);
    const key = `${folderStructure}/${timestamp}-${randomString}${fileExtension}`;

    // Generate presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      Metadata: {
        originalName: filename,
        uploadedAt: new Date().toISOString(),
      },
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Generate the public URL for the file
    const region = this.configService.get("AWS_DEFAULT_REGION") || this.configService.get("AWS_REGION") || "us-east-1";
    const publicUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

    return {
      presignedUrl,
      fields: {
        "Content-Type": contentType,
      },
      key,
      bucket: this.bucketName,
      url: publicUrl,
    };
  }

  private getFolderStructure(folder: string): string {
    // Create organized folder structure for different content types
    const folderMap = {
      projects: "portfolio/projects",
      uploads: "portfolio/uploads",
      media: "portfolio/media",
      avatars: "portfolio/avatars",
      documents: "portfolio/documents",
      portfolio: "portfolio/general",
    };

    return folderMap[folder] || `portfolio/${folder}`;
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : "";
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "portfolio",
  ): Promise<{
    publicId: string;
    url: string;
    secureUrl: string;
  }> {
    try {
      // Create organized folder structure
      const folderStructure = this.getFolderStructure(folder);

      // Generate unique file key
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = this.getFileExtension(file.originalname);
      const key = `${folderStructure}/${timestamp}-${randomString}${fileExtension}`;

      // Upload file to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Generate public URL
      const region = this.configService.get("AWS_DEFAULT_REGION") || this.configService.get("AWS_REGION") || "us-east-1";
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

      return {
        publicId: key, // Use S3 key as publicId for consistency
        url: url,
        secureUrl: url, // S3 URLs are always secure (HTTPS)
      };
    } catch (error) {
      console.error("S3 upload error details:", {
        bucketName: this.bucketName,
        error: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: publicId, // publicId is the S3 key
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }
}
