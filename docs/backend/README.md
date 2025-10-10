# AlloObbrico Backend API

Node.js/Express backend service for the AlloObbrico professional services marketplace.

## 📋 Overview

The backend provides RESTful APIs for user management, service requests, project tracking, and platform administration. Built with TypeScript for type safety and scalability.

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.2+
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL (planned)
- **Authentication**: JWT
- **Validation**: Express-validator
- **File Handling**: Multer
- **Development**: ts-node-dev, ESLint, Jest

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── auth.ts      # Authentication endpoints
│   │   ├── users.ts     # User management
│   │   ├── categories.ts # Service categories
│   │   ├── projects.ts  # Project management
│   │   ├── requests.ts  # Service requests
│   │   └── workers.ts   # Worker-specific endpoints
│   ├── types/           # TypeScript definitions
│   │   └── index.ts     # Type definitions
│   ├── middleware/      # Custom middleware (planned)
│   ├── utils/           # Utility functions (planned)
│   └── server.ts        # Application entry point
├── tests/               # Test files (planned)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:password@localhost:5432/allobbrico
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require authentication via JWT token:
```
Authorization: Bearer <token>
```

## 🔐 Authentication API

### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client"
    },
    "token": "jwt-token-here",
    "expiresIn": 86400
  },
  "message": "Login successful"
}
```

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "client"
}
```

### GET /api/auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

## 👥 Users API

### GET /api/users
List users with optional filtering.

**Query Parameters:**
- `role`: Filter by user role (client/worker/admin)
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Example:**
```
GET /api/users?role=worker&limit=5
```

### GET /api/users/:id
Get detailed user information by ID.

### GET /api/users/workers/top-rated
Get top-rated workers.

**Query Parameters:**
- `limit`: Number of results (default: 5)

### GET /api/users/workers/available
Get currently available workers.

### GET /api/users/workers/search
Search workers by skills and location.

**Query Parameters:**
- `skill`: Skill keyword
- `city`: City name
- `minRating`: Minimum rating (1-5)

## 🏷️ Categories API

### GET /api/categories
List all service categories.

**Query Parameters:**
- `popular`: Filter popular categories only (true/false)

### GET /api/categories/:id
Get category details by ID.

### GET /api/categories/popular/list
Get popular categories.

### GET /api/categories/search/:query
Search categories by name or description.

## 📋 Projects API

### GET /api/projects
List projects with filtering.

**Query Parameters:**
- `status`: Project status (open/in_progress/completed/cancelled)
- `category`: Service category
- `clientId`: Filter by client
- `workerId`: Filter by worker
- `limit`: Results per page
- `offset`: Pagination offset

### GET /api/projects/:id
Get project details by ID.

### GET /api/projects/stats/overview
Get project statistics overview.

### GET /api/projects/recent/list
Get recently created projects.

### GET /api/projects/category/:category
Get projects by category.

## 📝 Requests API

### GET /api/requests
List service requests with filtering.

**Query Parameters:**
- `status`: Request status (pending/assigned/in_progress/completed/cancelled)
- `category`: Service category
- `clientId`: Filter by client
- `urgency`: Urgency level (low/medium/high/emergency)
- `limit`: Results per page
- `offset`: Pagination offset

### GET /api/requests/:id
Get request details by ID.

### GET /api/requests/urgent
Get urgent and emergency requests.

### GET /api/requests/stats/overview
Get request statistics.

### GET /api/requests/recent/list
Get recently created requests.

## 🔧 Workers API

### GET /api/workers
List workers with advanced filtering.

**Query Parameters:**
- `skill`: Filter by skill
- `city`: Filter by city
- `minRating`: Minimum rating
- `maxRate`: Maximum hourly rate
- `available`: Available only (true/false)
- `limit`: Results per page
- `offset`: Pagination offset

### GET /api/workers/:id
Get worker profile by ID.

### GET /api/workers/top-rated/list
Get top-rated workers.

### GET /api/workers/available/list
Get available workers.

### GET /api/workers/stats/overview
Get worker statistics.

### GET /api/workers/skill/:skill
Get workers by specific skill.

### GET /api/workers/location/:city
Get workers in specific city.

## 📊 Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "data": <result_data>,
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Response:**
```json
{
  "error": "ErrorType",
  "message": "Human-readable error message"
}
```

## 🔒 Authentication & Security

### JWT Tokens
- Access tokens expire in 24 hours
- Refresh tokens for seamless authentication
- Tokens include user ID and role information

### Password Security
- bcrypt hashing with salt rounds
- Minimum password requirements
- Secure password reset flow

### Rate Limiting
- API rate limiting to prevent abuse
- Different limits for authenticated vs anonymous users

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Data Models

### User Types
- **Client**: Service requester
- **Worker**: Service provider
- **Admin**: Platform administrator

### Core Entities
- **User**: Base user information
- **Category**: Service categories
- **Project**: Completed work
- **ServiceRequest**: Client requests
- **Review**: User feedback

## 🔄 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-endpoint
   ```

2. **Implement Changes**
   - Add route handlers
   - Update types if needed
   - Add validation
   - Write tests

3. **Test Locally**
   ```bash
   npm run dev
   # Test endpoints with Postman/curl
   ```

4. **Code Quality**
   ```bash
   npm run lint
   npm run lint:fix
   npm test
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new endpoint for user search"
   ```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -f ../docker/Dockerfile.backend -t allobbrico-backend .
docker run -p 5000:5000 allobbrico-backend
```

## 📞 Support

For API-related questions:
- Check this documentation first
- Review the TypeScript types in `src/types/`
- Test endpoints with the provided examples
- Create an issue for bugs or feature requests

## 🔄 Future Enhancements

- [ ] Database integration (PostgreSQL + Prisma)
- [ ] File upload for images/documents
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search and filtering
- [ ] Payment integration
- [ ] Email notifications
- [ ] Admin dashboard APIs
- [ ] Analytics and reporting
- [ ] Mobile API optimizations