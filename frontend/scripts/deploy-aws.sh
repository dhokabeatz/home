#!/bin/bash

# AWS S3 and CloudFront Deployment Script for Frontend
# Usage: ./deploy-aws.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Configuration
BUCKET_NAME=${1:-"dhokabeatz-portfolio"}
DISTRIBUTION_ID=${2:-""}
BUILD_DIR="dist"
REGION=${AWS_REGION:-"us-east-1"}

echo "🚀 Starting AWS deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory '$BUILD_DIR' not found. Please run 'npm run build' first."
    exit 1
fi

echo "📦 Deploying to S3 bucket: $BUCKET_NAME"

# Create S3 bucket if it doesn't exist
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "🪣 Creating S3 bucket: $BUCKET_NAME"
    
    if [ "$REGION" == "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME"
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi
    
    echo "⏳ Waiting for bucket to be ready..."
    aws s3api wait bucket-exists --bucket "$BUCKET_NAME"
fi

# Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3api put-bucket-website --bucket "$BUCKET_NAME" --website-configuration '{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}'

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public access..."
aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*"
        }
    ]
}'

# Disable block public access settings
echo "🔐 Configuring bucket public access settings..."
aws s3api put-public-access-block --bucket "$BUCKET_NAME" --public-access-block-configuration '{
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
}'

# Upload files to S3 with proper caching headers
echo "📤 Uploading files to S3..."

# Upload static assets with long cache times
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "max-age=31536000" \
    --exclude "*" \
    --include "*.js" \
    --include "*.css" \
    --include "*.png" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.gif" \
    --include "*.svg" \
    --include "*.ico" \
    --include "*.woff" \
    --include "*.woff2" \
    --include "*.ttf" \
    --include "*.eot"

# Upload HTML files with short cache times
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --exclude "*" \
    --include "*.html"

# Upload all other files
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --exclude "*.js" \
    --exclude "*.css" \
    --exclude "*.png" \
    --exclude "*.jpg" \
    --exclude "*.jpeg" \
    --exclude "*.gif" \
    --exclude "*.svg" \
    --exclude "*.ico" \
    --exclude "*.woff" \
    --exclude "*.woff2" \
    --exclude "*.ttf" \
    --exclude "*.eot" \
    --exclude "*.html"

# Get S3 website endpoint
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "🌍 S3 Website URL: $WEBSITE_URL"

# Create CloudFront invalidation if distribution ID is provided
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "🔄 Creating CloudFront invalidation..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "⏳ Invalidation created with ID: $INVALIDATION_ID"
    echo "🌐 CloudFront URL: https://$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)"
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. If this is your first deployment, create a CloudFront distribution"
echo "2. Configure your custom domain in Route 53"
echo "3. Set up SSL certificate in AWS Certificate Manager"
echo "4. Update your DNS records to point to CloudFront"
