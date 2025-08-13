# AWS Authentication Methods for S3 Integration

## Overview

The portfolio application now supports multiple AWS authentication methods for S3 access, making it flexible for different deployment scenarios.

## Authentication Methods

### 1. AWS Profile/CLI (Development - Recommended for You)

Since you're already logged in with your AWS profile, this is the simplest approach:

**Required Environment Variables:**

```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-portfolio-bucket-name
```

**What happens:**

- AWS SDK automatically uses your default AWS profile credentials
- No need to manage access keys in environment variables
- Works great for local development

### 2. Explicit Credentials (Production/CI/CD)

For production deployments or CI/CD pipelines:

**Required Environment Variables:**

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-portfolio-bucket-name
```

### 3. IAM Roles (AWS Lambda - Automatic)

When deployed to AWS Lambda, the function automatically uses IAM roles:

**Required:**

- Only `AWS_REGION` and `AWS_S3_BUCKET_NAME`
- Serverless Framework configures IAM permissions automatically

## How It Works

The upload service now uses smart credential detection:

```typescript
// Only add explicit credentials if they are provided
// Otherwise, AWS SDK will use default profile/IAM role credentials
const accessKeyId = this.configService.get("AWS_ACCESS_KEY_ID");
const secretAccessKey = this.configService.get("AWS_SECRET_ACCESS_KEY");

if (accessKeyId && secretAccessKey) {
  s3Config.credentials = {
    accessKeyId,
    secretAccessKey,
  };
}
// If no explicit credentials, AWS SDK uses:
// 1. AWS CLI profile credentials (~/.aws/credentials)
// 2. IAM role (in Lambda)
// 3. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
```

## For Your Setup

Since you have AWS CLI configured:

1. **Update your `.env`:**

```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-actual-bucket-name
# No need for AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
```

2. **Create your S3 bucket:**

```bash
aws s3 mb s3://your-portfolio-bucket-name --region us-east-1
```

3. **Set bucket policy for public read:**

```bash
aws s3api put-bucket-policy --bucket your-portfolio-bucket-name --policy '{
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
}'
```

4. **Enable CORS:**

```bash
aws s3api put-bucket-cors --bucket your-portfolio-bucket-name --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}'
```

## Testing

Test that your AWS profile has S3 access:

```bash
# List your buckets
aws s3 ls

# Test upload to your bucket
echo "test" | aws s3 cp - s3://your-portfolio-bucket-name/test.txt

# Verify upload
aws s3 ls s3://your-portfolio-bucket-name/
```

## Security Benefits

1. **No credentials in code** - Uses AWS profile/IAM roles
2. **Automatic rotation** - AWS handles credential lifecycle
3. **Least privilege** - IAM policies control exact permissions
4. **Audit trail** - CloudTrail logs all S3 operations

This approach is much more secure and convenient than managing access keys manually!
