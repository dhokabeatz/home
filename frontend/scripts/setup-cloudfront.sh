#!/bin/bash

# CloudFront Distribution Setup Script
# Usage: ./setup-cloudfront.sh [bucket-name] [domain-name]

set -e

BUCKET_NAME=${1:-"dhokabeatz-portfolio"}
DOMAIN_NAME=${2:-"dhokabeatz.com"}
REGION=${AWS_REGION:-"us-east-1"}

echo "🌐 Creating CloudFront distribution for $DOMAIN_NAME"

# Get S3 website endpoint
S3_WEBSITE_ENDPOINT="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

# Create CloudFront distribution
DISTRIBUTION_CONFIG='{
    "CallerReference": "'$(date +%s)'",
    "Comment": "Portfolio website distribution for '$DOMAIN_NAME'",
    "DefaultRootObject": "index.html",
    "Aliases": {
        "Quantity": 2,
        "Items": [
            "'$DOMAIN_NAME'",
            "www.'$DOMAIN_NAME'"
        ]
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-Website-'$BUCKET_NAME'",
                "DomainName": "'$S3_WEBSITE_ENDPOINT'",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-Website-'$BUCKET_NAME'",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "Compress": true
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}'

echo "📦 Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config "$DISTRIBUTION_CONFIG" \
    --query 'Distribution.Id' \
    --output text)

echo "✅ CloudFront distribution created with ID: $DISTRIBUTION_ID"

# Get CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id "$DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)

echo "🌐 CloudFront Domain: $CLOUDFRONT_DOMAIN"
echo ""
echo "📋 Next steps:"
echo "1. Wait for distribution to deploy (15-20 minutes)"
echo "2. Create SSL certificate in ACM for $DOMAIN_NAME and www.$DOMAIN_NAME"
echo "3. Update CloudFront distribution to use the SSL certificate"
echo "4. Create Route 53 hosted zone for $DOMAIN_NAME"
echo "5. Add A records pointing to the CloudFront distribution"
echo ""
echo "💡 Save this distribution ID for future deployments:"
echo "   CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID"
