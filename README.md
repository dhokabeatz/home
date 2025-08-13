# Ing. Henry - Dynamic Portfolio Website

A modern, full-stack portfolio website built with React (frontend) and NestJS (backend), featuring a comprehensive admin dashboard, analytics tracking, and content management system. Deployed on AWS with S3, CloudFront, Lambda, and API Gateway.

## 🚀 Features

### Public Website
- **Responsive Design**: Mobile-first approach with smooth animations
- **Dynamic Content**: All content managed through admin dashboard
- **Project Showcase**: Interactive project gallery with detailed views
- **Contact Form**: Spam-protected contact form with email notifications
- **Analytics Tracking**: Custom visitor analytics and session tracking
- **SEO Optimized**: Meta tags, structured data, and performance optimized

### Admin Dashboard
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Content Management**: Full CRUD for projects, services, skills, and team
- **Media Library**: File upload and management with Cloudinary integration
- **Analytics Dashboard**: Visitor insights, charts, and performance metrics
- **Contact Management**: View, respond to, and manage contact submissions
- **Settings Panel**: Site configuration and user preferences

### Backend API
- **RESTful API**: Well-documented API with Swagger/OpenAPI
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, helmet, input validation
- **Email Service**: Nodemailer for notifications and alerts
- **File Storage**: Cloudinary integration for media files
- **Serverless**: AWS Lambda deployment with API Gateway

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form handling

### Backend
- **NestJS** with TypeScript
- **Prisma** ORM with PostgreSQL
- **JWT** authentication
- **Winston** for logging
- **Swagger** for API documentation
- **Serverless Framework** for AWS Lambda deployment

### Infrastructure
- **AWS S3** for static website hosting
- **AWS CloudFront** for CDN and SSL
- **AWS Lambda** for serverless backend
- **AWS API Gateway** for API management
- **AWS Route 53** for DNS management
- **AWS Certificate Manager** for SSL certificates

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis server
- AWS S3 bucket (for file storage)

### 1. Clone the repository
```bash
git clone https://github.com/henryagyemang/ing-henry-portfolio.git
cd ing-henry-portfolio
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Environment Setup

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/henry_portfolio"
JWT_SECRET="your-super-secret-jwt-key"
REDIS_HOST="localhost"
REDIS_PORT="6379"
# ... other variables
```

#### Frontend Environment
```bash
cd frontend
echo "VITE_API_URL=http://localhost:4000/api" > .env
```

### 4. Database Setup
```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### 5. Start Development Servers

#### Option 1: Start both servers simultaneously
```bash
# From root directory
npm run dev
```

#### Option 2: Start servers separately
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Documentation**: http://localhost:4000/api/docs
- **Admin Dashboard**: http://localhost:3000/admin

### Default Admin Credentials
- **Email**: admin@henry.com
- **Password**: password

## 📁 Project Structure

```
ing-henry-portfolio/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── projects/       # Projects CRUD module
│   │   ├── analytics/      # Analytics tracking
│   │   └── common/         # Shared utilities
│   └── prisma/             # Database schema and migrations
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## 🔧 Development

### Available Scripts

#### Root Level
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run test         # Run all tests
npm run lint         # Lint all code
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
```

#### Backend
```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start:prod   # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Database Management

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio
```

## 🚀 Deployment

This project supports both local development and AWS production deployment with full CI/CD pipelines.

### Local Development

#### Option 1: Traditional Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option 2: Serverless Local Testing
```bash
# Terminal 1 - Backend with Serverless Offline
cd backend
npm run start:offline

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### AWS Production Deployment

The project is configured for AWS deployment with the following architecture:

- **Frontend**: React app → S3 Static Website → CloudFront CDN → Route 53 + ACM SSL
- **Backend**: NestJS API → AWS Lambda → API Gateway → Route 53

#### Prerequisites
- AWS CLI installed and configured
- Node.js 18+ installed
- Domain name registered

#### Quick Deploy Commands

**Backend (AWS Lambda):**
```bash
cd backend
cp .env.example .env
# Configure your .env file
npm run deploy:prod
```

**Frontend (S3 + CloudFront):**
```bash
cd frontend
npm run build
./scripts/deploy-aws.sh dhokabeatz-portfolio
./scripts/setup-cloudfront.sh dhokabeatz-portfolio dhokabeatz.com
```

#### CI/CD with GitHub Actions

The project includes automated deployment workflows:

1. **Push to main branch** → Triggers deployment
2. **Frontend changes** → Deploy to S3 + CloudFront invalidation  
3. **Backend changes** → Deploy to AWS Lambda

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_*` variables
- `EMAIL_*` variables
- `VITE_API_URL`
- `CLOUDFRONT_DISTRIBUTION_ID`

#### Detailed Setup Guide

For complete AWS setup instructions, see **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)**

### Environment Variables for Production

#### Backend (.env)
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
FRONTEND_URL="https://dhokabeatz.com"
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://api-id.execute-api.us-east-1.amazonaws.com/prod/api
VITE_APP_NAME="Ing. Henry Portfolio"
VITE_NODE_ENV=production
```

## 📊 Features in Detail

### Analytics System
- Custom visitor tracking
- Session duration monitoring
- Device and browser detection
- Geographic location tracking
- Real-time dashboard with charts

### Content Management
- Rich text editor for project descriptions
- Image upload and management
- SEO meta tag management
- Content scheduling and publishing

### Security Features
- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Henry Agyemang**
- Website: [henryagyemang.dev](https://henryagyemang.dev)
- GitHub: [@henryagyemang](https://github.com/henryagyemang)
- LinkedIn: [Henry Agyemang](https://linkedin.com/in/henryagyemang)

## 🙏 Acknowledgments

- Design inspiration from modern portfolio websites
- Icons from Lucide React
- Images from Pexels
- Built with love and lots of coffee ☕

---

For more detailed documentation, please refer to the `/docs` directory or visit the API documentation at `/api/docs` when running the development server.