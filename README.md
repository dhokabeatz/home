# Ing. Henry - Dynamic Portfolio Website

A modern, full-stack portfolio website built with React (frontend) and NestJS (backend), featuring a comprehensive admin dashboard, analytics tracking, and content management system.

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
- **Media Library**: File upload and management with AWS S3 integration
- **Analytics Dashboard**: Visitor insights, charts, and performance metrics
- **Contact Management**: View, respond to, and manage contact submissions
- **Settings Panel**: Site configuration and user preferences

### Backend API
- **RESTful API**: Well-documented API with Swagger/OpenAPI
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for improved performance
- **Security**: Rate limiting, CORS, helmet, input validation
- **Email Service**: Nodemailer for notifications and alerts
- **File Storage**: AWS S3 integration for media files

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
- **Redis** for caching
- **Winston** for logging
- **Swagger** for API documentation
- **AWS SDK** for S3 integration

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

### Frontend (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables

### Backend (AWS ECS/Railway/Heroku)
1. Build the backend: `cd backend && npm run build`
2. Set up production database and Redis
3. Configure environment variables
4. Deploy using your preferred platform

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment, especially:
- `DATABASE_URL`
- `JWT_SECRET`
- `AWS_*` variables for S3
- `SMTP_*` variables for email

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