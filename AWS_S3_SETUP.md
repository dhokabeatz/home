# AWS S3 Setup Guide for Image Uploads

## Overview

The portfolio application now supports S3 image uploads using presigned URLs. This allows secure, direct uploads from the frontend to AWS S3.

## Required AWS Setup

### 1. Create an S3 Bucket

```bash
# Using AWS CLI (optional)
aws s3 mb s3://your-portfolio-bucket-name --region us-east-1
```

Or create through AWS Console:

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique name (e.g., `henry-portfolio-media`)
4. Select region (e.g., `us-east-1`)
5. Enable public read access for uploaded files
6. Create bucket

### 2. Configure CORS Policy

Add this CORS policy to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3003",
      "http://localhost:3004",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Create IAM User

1. Go to IAM Console
2. Create new user for the application
3. Attach policy with S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-portfolio-bucket-name/*"
    }
  ]
}
```

### 4. Update Environment Variables

Update `backend/.env`:

```properties
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-portfolio-bucket-name
```

## Features Implemented

### Backend Endpoints

- `POST /api/upload/presigned-url` - Generate presigned URL for upload
- `POST /api/upload/confirm` - Confirm successful upload

### Frontend Features

- **AdminMedia**: Direct S3 image uploads with progress feedback
- **File Validation**: Type and size validation (images only, max 10MB)
- **Error Handling**: Comprehensive error messages and loading states
- **Gallery Management**: View uploaded files and project screenshots

### Usage

1. Navigate to Admin Dashboard → Media
2. Click "Upload Files" or drag and drop images
3. Files are uploaded directly to S3
4. Public URLs are returned and stored in the gallery

## Security Features

- Presigned URLs expire in 5 minutes
- Authentication required for upload endpoint
- File type validation (images only)
- File size limits (10MB max)

## Next Steps

To complete the integration:

1. Add AWS credentials to your environment
2. Create and configure S3 bucket
3. Test image uploads in the admin panel
4. Consider adding project screenshot management
