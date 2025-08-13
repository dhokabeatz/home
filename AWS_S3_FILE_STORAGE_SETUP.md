# AWS S3 File Storage Setup Guide

This guide explains how to set up AWS S3 for file storage in the portfolio application, replacing the previous Cloudinary integration.

## Overview

The application now uses AWS S3 for storing:

- Project images and screenshots
- User avatars and profile pictures
- Media files and documents
- CV/Resume uploads
- Any other user-generated content

Files are organized in a structured folder hierarchy for better management.

## Folder Structure

The S3 bucket uses the following organized folder structure:

```
portfolio/
├── projects/          # Project images and screenshots
├── avatars/           # User profile pictures
├── media/             # General media files
├── uploads/           # General uploads
├── documents/         # Documents and PDFs
└── general/           # Default folder for misc files
```

## AWS Setup Steps

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket with these settings:
   - Bucket name: `your-portfolio-bucket-name` (must be globally unique)
   - Region: `us-east-1` (or your preferred region)
   - Block all public access: **Unchecked** (for public read access)

### 2. Configure Bucket Policy

Add this bucket policy to allow public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-portfolio-bucket-name/*"
    }
  ]
}
```

### 3. Enable CORS

Configure CORS settings for browser uploads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 4. Create IAM User

1. Go to IAM Console
2. Create new user with programmatic access
3. Attach this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-portfolio-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::your-portfolio-bucket-name"
    }
  ]
}
```

### 5. Configure Environment Variables

Update your `.env` files with the S3 configuration:

**Backend (.env):**

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=your-portfolio-bucket-name
```

**Production Environment:**
Set these same variables in your deployment environment (AWS Lambda, etc.)

## API Changes

### Upload Endpoints

The following endpoints remain the same but now use S3:

- `POST /api/upload/signature` - Generate presigned URL for S3 upload
- `POST /api/upload/direct` - Direct upload to S3 via backend
- `POST /api/upload/confirm` - Confirm successful upload

### Frontend Integration

The frontend upload methods have been updated:

```typescript
// Direct upload (simpler)
const imageUrl = await api.uploadImage(file, "projects");

// Presigned URL upload (more secure for large files)
const imageUrl = await api.uploadImageSigned(file, "avatars");
```

## File Organization

Files are automatically organized by folder type:

- `projects` → `portfolio/projects/`
- `avatars` → `portfolio/avatars/`
- `media` → `portfolio/media/`
- `uploads` → `portfolio/uploads/`
- `documents` → `portfolio/documents/`

Each file gets a unique name: `{timestamp}-{random}.{extension}`

## Benefits of S3 Migration

1. **Cost Effective** - Pay only for what you use
2. **Scalable** - No storage limits
3. **Fast** - Global CDN integration available
4. **Reliable** - 99.999999999% durability
5. **Flexible** - Easy to configure and manage
6. **Secure** - Fine-grained access controls

## Migration Notes

- All existing Cloudinary URLs will need to be updated
- Database records with file URLs should be updated
- Consider implementing a migration script for existing data

## Testing

To test the S3 integration:

1. Set up your S3 bucket and IAM user
2. Update environment variables
3. Start the backend server
4. Test file upload through the frontend
5. Verify files appear in your S3 bucket

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check IAM permissions and bucket policy
2. **CORS Errors**: Verify CORS configuration
3. **Upload Fails**: Check AWS credentials and bucket name
4. **Files Not Public**: Verify bucket policy allows public read

### Debug Steps

1. Check AWS credentials in environment variables
2. Verify bucket exists and is in correct region
3. Test IAM user permissions with AWS CLI
4. Check network connectivity to AWS

## Security Considerations

1. Never expose AWS credentials in frontend code
2. Use presigned URLs for secure client uploads
3. Implement file type and size validation
4. Consider using AWS CloudFront for CDN
5. Enable S3 versioning for important files
6. Monitor usage with CloudWatch

## Future Enhancements

- **CloudFront CDN**: Add CDN for faster global access
- **Image Processing**: Use AWS Lambda for image optimization
- **Backup**: Configure cross-region replication
- **Monitoring**: Set up CloudWatch alerts
- **Lifecycle**: Configure automatic cleanup of old files
