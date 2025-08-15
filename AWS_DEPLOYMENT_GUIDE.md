# AWS Deployment Guide

This guide explains how to deploy the Ing. Henry Portfolio to AWS using S3, CloudFront, Lambda, API Gateway, Route 53, and Certificate Manager.

## Prerequisites

1. **AWS CLI** installed and configured
2. **Node.js 18+** installed
3. **AWS Account** with appropriate permissions
4. **Domain name** registered (we'll use `dhokabeatz.com`)

## Architecture Overview

- **Frontend**: React app hosted on S3, served via CloudFront CDN
- **Backend**: NestJS API deployed to Lambda via API Gateway
- **Database**: SQLite (file-based, included with deployment)
- **Domain**: Route 53 for DNS management
- **SSL**: Certificate Manager for HTTPS

## Step 1: Backend Deployment (AWS Lambda + API Gateway)

### 1.1 Environment Variables Setup

Create a `.env` file in the `backend` directory:

```bash
# Database (SQLite file-based - no external service needed)
DATABASE_URL="file:./prod.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@dhokabeatz.com"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_BUCKET_NAME="your-portfolio-bucket-name"

# Paystack
PAYSTACK_SECRET_KEY="your-paystack-secret-key"

# AWS Configuration
AWS_REGION="us-east-1"

# Application
NODE_ENV="production"
FRONTEND_URL="https://dhokabeatz.com"
```

### 1.2 Deploy Backend

```bash
cd backend
npm install
npm run build
npm run deploy:prod
```

This will:

- Build the NestJS application
- Deploy to AWS Lambda
- Create API Gateway endpoints
- Return the API Gateway URL

### 1.3 Test Backend Locally

```bash
cd backend
npm run start:offline
```

The backend will be available at `http://localhost:4000`

## Step 2: Frontend Deployment (S3 + CloudFront)

### 2.1 Update API URL

After deploying the backend, update `frontend/.env.production` with your API Gateway URL:

```bash
VITE_API_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod/api
VITE_APP_NAME=Ing. Henry Portfolio
VITE_NODE_ENV=production
```

### 2.2 Build and Deploy Frontend

```bash
cd frontend
npm install
npm run build

# Deploy to S3
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh dhokabeatz-portfolio
```

### 2.3 Setup CloudFront Distribution

```bash
chmod +x scripts/setup-cloudfront.sh
./scripts/setup-cloudfront.sh dhokabeatz-portfolio dhokabeatz.com
```

## Step 3: SSL Certificate Setup

### 3.1 Create SSL Certificate in ACM

```bash
# Request certificate for your domain
aws acm request-certificate \
  --domain-name dhokabeatz.com \
  --subject-alternative-names www.dhokabeatz.com \
  --validation-method DNS \
  --region us-east-1
```

### 3.2 Validate Certificate

1. Go to AWS Console > Certificate Manager
2. Click on your certificate
3. Add the DNS validation records to your domain's DNS settings

## Step 4: Route 53 Setup

### 4.1 Create Hosted Zone

```bash
aws route53 create-hosted-zone \
  --name dhokabeatz.com \
  --caller-reference $(date +%s)
```

### 4.2 Update Domain Name Servers

Get the name servers from the hosted zone and update them with your domain registrar.

### 4.3 Create DNS Records

```bash
# Get CloudFront distribution domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

# Create A record for apex domain
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "dhokabeatz.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "'$CLOUDFRONT_DOMAIN'",
          "EvaluateTargetHealth": false,
          "HostedZoneId": "Z2FDTNDATAQYW2"
        }
      }
    }]
  }'

# Create A record for www subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.dhokabeatz.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "'$CLOUDFRONT_DOMAIN'",
          "EvaluateTargetHealth": false,
          "HostedZoneId": "Z2FDTNDATAQYW2"
        }
      }
    }]
  }'
```

## Step 5: GitHub Actions CI/CD Setup

### 5.1 Configure GitHub Secrets

Add these secrets to your GitHub repository settings:

**AWS Credentials:**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., `us-east-1`)

**Backend Environment Variables:**

- `DATABASE_URL`
- `JWT_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `PAYSTACK_SECRET_KEY`

**Frontend Configuration:**

- `VITE_API_URL` (your API Gateway URL)
- `CLOUDFRONT_DISTRIBUTION_ID`

### 5.2 Trigger Deployments

Push to the `main` branch to trigger automatic deployments:

- Changes in `frontend/` trigger frontend deployment
- Changes in `backend/` trigger backend deployment

## Step 6: Local Development

### 6.1 Backend Local Development

```bash
cd backend
cp .env.example .env
# Update .env with your local settings
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 6.2 Frontend Local Development

```bash
cd frontend
npm install
npm run dev
```

### 6.3 Test Full Stack Locally

```bash
# Terminal 1: Backend with Serverless Offline
cd backend
npm run start:offline

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Monitoring and Maintenance

### View Lambda Logs

```bash
cd backend
npm run logs
```

### Update CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

## Cost Optimization

- **S3**: Pay only for storage and data transfer
- **CloudFront**: First 1TB of data transfer is free
- **Lambda**: First 1M requests and 400,000 GB-seconds are free
- **API Gateway**: First 1M API calls are free
- **Route 53**: $0.50 per hosted zone per month

## Security Considerations

1. Use environment variables for all secrets
2. Enable CloudFront access logs for monitoring
3. Set up AWS CloudTrail for audit logging
4. Use IAM roles with minimal required permissions
5. Enable AWS WAF on CloudFront for additional protection

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update backend CORS settings to include your domain
2. **API Gateway Timeout**: Increase Lambda timeout in `serverless.yml`
3. **Prisma Client Issues**: Ensure `prisma generate` runs during deployment
4. **SSL Certificate**: Ensure certificate is validated and in `us-east-1` region

### Debug Commands

```bash
# Check Lambda function logs
aws logs tail /aws/lambda/ing-henry-portfolio-backend-prod-main --follow

# Test API Gateway endpoint
curl -X GET https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/health

# Check CloudFront status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```
