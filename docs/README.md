# AlloObbrico - Professional Services Marketplace

A comprehensive full-stack platform connecting clients with skilled workers for home improvement and professional services in France.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AlloObbrico is a digital marketplace that bridges the gap between clients seeking professional services and qualified workers in the home improvement sector. The platform focuses on transparency, quality assurance, and seamless user experience for both service providers and consumers.

### Mission
To democratize access to quality professional services while ensuring fair compensation and job satisfaction for skilled workers.

### Target Market
- Homeowners and renters needing home improvement services
- Small businesses requiring maintenance and renovation work
- Professional service providers (plumbers, electricians, carpenters, etc.)
- Located primarily in Paris and surrounding areas

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-role System**: Support for Clients, Workers, and Administrators
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Profile Management**: Comprehensive user profiles with preferences and settings
- **Password Recovery**: Secure password reset functionality

### 👥 User Roles & Features

#### Clients
- **Service Discovery**: Browse categories and find qualified workers
- **Request Management**: Create, track, and manage service requests
- **Worker Selection**: View worker profiles, ratings, and portfolios
- **Project Tracking**: Monitor project progress and completion
- **Review System**: Rate and review completed services

#### Workers
- **Profile Showcase**: Display skills, experience, certifications, and portfolio
- **Availability Management**: Set working hours and service areas
- **Request Response**: Accept or decline service requests
- **Project Management**: Track assigned projects and update status
- **Earnings Dashboard**: Monitor income and service history

#### Administrators
- **Platform Oversight**: Monitor platform activity and performance
- **User Management**: Moderate users and resolve disputes
- **Category Management**: Add and manage service categories
- **Analytics Dashboard**: View platform metrics and insights

### 🛠️ Service Categories
- **Plomberie** (Plumbing)
- **Électricité** (Electricity)
- **Peinture** (Painting)
- **Jardinage** (Gardening)
- **Menuiserie** (Carpentry)
- **Climatisation** (HVAC)
- **Maçonnerie** (Masonry)
- **Nettoyage** (Cleaning)
- **Dépannage d'urgence** (Emergency Repairs)
- **Rénovation** (Renovation)

### 📊 Advanced Features
- **Smart Matching**: AI-powered worker-client matching based on skills and location
- **Real-time Notifications**: Instant updates on request status and messages
- **Geolocation Services**: Location-based worker search and service areas
- **Rating & Review System**: Comprehensive feedback mechanism
- **Portfolio Management**: Visual showcase of completed work
- **Emergency Services**: 24/7 urgent repair coordination

### 💳 Payment & Billing
- **Secure Payments**: Integrated payment processing
- **Transparent Pricing**: Clear pricing structure with no hidden fees
- **Worker Payouts**: Automated and timely compensation
- **Invoice Generation**: Professional invoicing system

### 📱 Mobile-First Design
- **Responsive Interface**: Optimized for all device sizes
- **Progressive Web App**: Installable mobile experience
- **Offline Capability**: Core functionality available offline
- **Push Notifications**: Real-time alerts and updates

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Express-validator
- **File Upload**: Multer for image handling
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest testing framework

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Material-UI (MUI) with Emotion
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet for location services
- **Build Tool**: Create React App
- **Testing**: Jest and React Testing Library

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx for production
- **Process Management**: PM2 for production deployment
- **CI/CD**: GitHub Actions
- **Monitoring**: Application logging and error tracking

### Development Tools
- **Code Quality**: ESLint and Prettier
- **API Testing**: Postman and Thunder Client
- **Version Control**: Git with conventional commits
- **Documentation**: Markdown with automated generation

## 📁 Project Structure

```
allobbrico-fullstack/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Application entry point
│   ├── tests/              # Backend tests
│   └── docs/               # Backend-specific documentation
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Frontend utilities
│   │   ├── types/          # Frontend type definitions
│   │   └── services/       # API service layer
│   ├── public/             # Static assets
│   └── tests/              # Frontend tests
├── database/                # Database files and migrations
│   ├── init.sql           # Database initialization
│   └── migrations/        # Database schema changes
├── docker/                 # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx/
├── docs/                   # Project documentation
│   ├── backend/           # Backend documentation
│   ├── frontend/          # Frontend documentation
│   └── *.md               # General documentation
├── .github/               # GitHub configuration
│   └── workflows/         # CI/CD pipelines
└── docker-compose*.yml    # Docker Compose files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- PostgreSQL (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd allobbrico-fullstack
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies (concurrently for dev scripts)
   npm install

   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run backend:dev    # Backend on http://localhost:5000
   npm run frontend:dev   # Frontend on http://localhost:3000
   ```

5. **Database Setup** (with Docker)
   ```bash
   docker-compose -f docker-compose.dev.yml up -d database
   ```

### Production Deployment

```bash
# Build for production
npm run build

# Start production servers
docker-compose up -d
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.allobbrico.com/api`

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile

#### Users
- `GET /api/users` - List users with filtering
- `GET /api/users/:id` - Get user details
- `GET /api/users/workers/top-rated` - Top-rated workers

#### Categories
- `GET /api/categories` - List service categories
- `GET /api/categories/:id` - Category details

#### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Project details
- `GET /api/projects/stats/overview` - Project statistics

#### Service Requests
- `GET /api/requests` - List service requests
- `GET /api/requests/:id` - Request details
- `GET /api/requests/urgent` - Urgent requests

#### Workers
- `GET /api/workers` - List workers with filtering
- `GET /api/workers/:id` - Worker profile
- `GET /api/workers/available` - Available workers

For detailed API documentation, see [Backend API Docs](./backend/API.md).

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with TypeScript support
- **Prettier**: Automated code formatting
- **Conventional Commits**: Structured commit messages

### Testing
- **Unit Tests**: Jest for both frontend and backend
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Cypress for critical user flows

### Git Workflow
1. Create feature branch from `main`
2. Follow conventional commit format
3. Create pull request with description
4. Code review and approval
5. Merge to `main`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code of Conduct
Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.allobbrico.com](https://docs.allobbrico.com)
- **Issues**: [GitHub Issues](https://github.com/allobbrico/allobbrico-fullstack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/allobbrico/allobbrico-fullstack/discussions)
- **Email**: support@allobbrico.com

## 🙏 Acknowledgments

- Material-UI team for the excellent React component library
- The Express.js community for the robust web framework
- All our contributors and early adopters

---

**AlloObbrico** - Connecting Quality Service with Those Who Need It 🏠✨