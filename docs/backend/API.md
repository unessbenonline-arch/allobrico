# AlloObbrico Backend API Reference

Complete API documentation for all endpoints with examples and data models.

## 📡 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication

### POST /api/auth/login

Authenticate user and return JWT token.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "marie.dupont@email.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "client-1",
      "email": "marie.dupont@email.com",
      "firstName": "Marie",
      "lastName": "Dupont",
      "role": "client",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-03-20T14:45:00Z"
    },
    "token": "mock-jwt-token-client-1-1738523400000",
    "expiresIn": 86400
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `401`: Invalid credentials
- `500`: Server error

### POST /api/auth/register

Register a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@email.com",
  "password": "securepassword",
  "firstName": "Jean",
  "lastName": "Martin",
  "role": "client"
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": "user-1738523400000",
      "email": "newuser@email.com",
      "firstName": "Jean",
      "lastName": "Martin",
      "role": "client",
      "createdAt": "2024-03-25T12:00:00Z",
      "updatedAt": "2024-03-25T12:00:00Z"
    },
    "token": "mock-jwt-token-user-1738523400000-1738523400000",
    "expiresIn": 86400
  },
  "message": "Registration successful"
}
```

### GET /api/auth/me

Get current authenticated user profile.

**Request:**
```http
GET /api/auth/me
Authorization: Bearer mock-jwt-token-client-1-1738523400000
```

**Response (200):**
```json
{
  "data": {
    "id": "client-1",
    "email": "marie.dupont@email.com",
    "firstName": "Marie",
    "lastName": "Dupont",
    "role": "client",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-03-20T14:45:00Z"
  }
}
```

## 👥 Users API

### GET /api/users

List users with optional filtering and pagination.

**Query Parameters:**
- `role` (optional): Filter by role - `client`, `worker`, or `admin`
- `limit` (optional): Number of results per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Request:**
```http
GET /api/users?role=worker&limit=2&offset=0
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "worker-1",
      "email": "jean.plombier@email.com",
      "firstName": "Jean",
      "lastName": "Dubois",
      "role": "worker",
      "createdAt": "2023-06-10T08:00:00Z",
      "updatedAt": "2024-03-25T10:15:00Z"
    },
    {
      "id": "worker-2",
      "email": "marc.electricien@email.com",
      "firstName": "Marc",
      "lastName": "Leroy",
      "role": "worker",
      "createdAt": "2023-08-15T09:30:00Z",
      "updatedAt": "2024-03-22T14:20:00Z"
    }
  ],
  "pagination": {
    "total": 9,
    "limit": 2,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/users/:id

Get detailed user information by ID.

**Request:**
```http
GET /api/users/worker-1
```

**Response (200):**
```json
{
  "data": {
    "id": "worker-1",
    "email": "jean.plombier@email.com",
    "firstName": "Jean",
    "lastName": "Dubois",
    "phone": "+33123456792",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
    "role": "worker",
    "bio": "Plombier expérimenté avec 15 ans d'expérience...",
    "skills": ["Plomberie", "Chauffage", "Installation sanitaire"],
    "experience": 15,
    "rating": 4.8,
    "reviewCount": 127,
    "hourlyRate": 45,
    "availability": true,
    "location": {
      "city": "Paris",
      "postalCode": "75001",
      "radius": 25
    },
    "certifications": ["Qualification Plomberie", "Certificat de capacité"],
    "portfolio": ["https://example.com/portfolio1.jpg"],
    "completedProjects": 89,
    "createdAt": "2023-06-10T08:00:00Z",
    "updatedAt": "2024-03-25T10:15:00Z"
  }
}
```

### GET /api/users/workers/top-rated

Get top-rated workers.

**Query Parameters:**
- `limit` (optional): Number of results (default: 5)

**Request:**
```http
GET /api/users/workers/top-rated?limit=3
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "worker-2",
      "firstName": "Marc",
      "lastName": "Leroy",
      "rating": 4.9,
      "reviewCount": 95,
      "skills": ["Électricité", "Domotique", "Panneaux solaires"]
    },
    {
      "id": "worker-1",
      "firstName": "Jean",
      "lastName": "Dubois",
      "rating": 4.8,
      "reviewCount": 127,
      "skills": ["Plomberie", "Chauffage", "Installation sanitaire"]
    },
    {
      "id": "worker-5",
      "firstName": "Lucas",
      "lastName": "Petit",
      "rating": 4.8,
      "reviewCount": 89,
      "skills": ["Menuiserie", "Ébénisterie", "Rénovation bois"]
    }
  ]
}
```

## 🏷️ Categories API

### GET /api/categories

List all service categories.

**Query Parameters:**
- `popular` (optional): Filter popular categories only (`true`/`false`)

**Request:**
```http
GET /api/categories?popular=true
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "cat-1",
      "name": "Plomberie",
      "description": "Installation et réparation de systèmes de plomberie",
      "icon": "🔧",
      "subcategories": ["Installation WC", "Réparation fuite", "Chauffage"],
      "popular": true
    },
    {
      "id": "cat-2",
      "name": "Électricité",
      "description": "Travaux électriques et installations",
      "icon": "⚡",
      "subcategories": ["Installation prises", "Réparation panne", "Domotique"],
      "popular": true
    }
  ],
  "total": 10
}
```

### GET /api/categories/search/:query

Search categories by name or description.

**Request:**
```http
GET /api/categories/search/electric
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "cat-2",
      "name": "Électricité",
      "description": "Travaux électriques et installations",
      "icon": "⚡",
      "popular": true
    }
  ]
}
```

## 📋 Projects API

### GET /api/projects

List projects with filtering.

**Query Parameters:**
- `status` (optional): Project status
- `category` (optional): Service category
- `clientId` (optional): Filter by client
- `workerId` (optional): Filter by worker
- `limit` (optional): Results per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Request:**
```http
GET /api/projects?status=completed&limit=2
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "proj-1",
      "title": "Rénovation salle de bain complète",
      "description": "Rénovation complète d'une salle de bain...",
      "category": "Rénovation",
      "clientId": "client-1",
      "workerId": "worker-1",
      "status": "completed",
      "budget": {
        "min": 8000,
        "max": 12000,
        "currency": "EUR"
      },
      "location": {
        "address": "15 Rue de la Paix",
        "city": "Paris",
        "postalCode": "75001"
      },
      "timeline": {
        "startDate": "2024-02-01",
        "endDate": "2024-02-15",
        "estimatedDuration": 14
      },
      "images": ["https://example.com/project1-before.jpg"],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-02-15T16:30:00Z"
    }
  ],
  "pagination": {
    "total": 4,
    "limit": 2,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/projects/stats/overview

Get project statistics overview.

**Request:**
```http
GET /api/projects/stats/overview
```

**Response (200):**
```json
{
  "data": {
    "total": 6,
    "completed": 4,
    "inProgress": 1,
    "open": 1,
    "cancelled": 0,
    "averageBudget": 5750
  }
}
```

## 📝 Requests API

> 📖 **Complete Request Management Documentation**: See [`request-management.md`](../request-management.md) for detailed information about request statuses, lifecycle, and assignee management.

### Request Status Lifecycle

Requests follow a defined lifecycle with the following statuses:
- **`open`**: Request published and available for assignment
- **`assigned`**: Request assigned to a specific worker
- **`in_progress`**: Work has started
- **`completed`**: Work finished successfully
- **`cancelled`**: Request cancelled

For assigned requests, full assignee profile information is available including contact details, ratings, and portfolio.

### GET /api/requests

List service requests with filtering.

**Query Parameters:**
- `status` (optional): Request status (`open`, `assigned`, `in_progress`, `completed`, `cancelled`)
- `category` (optional): Service category
- `clientId` (optional): Filter by client
- `urgency` (optional): Urgency level (`low`, `normal`, `high`, `urgent`)
- `limit` (optional): Results per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `include` (optional): Include related data (`assignee` for assigned requests)

**Request:**
```http
GET /api/requests?status=assigned&include=assignee
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "req-2",
      "clientId": "client-2",
      "category": "Électricité",
      "title": "Installation domotique salon",
      "description": "Installation d'un système domotique complet...",
      "urgency": "medium",
      "budget": {
        "min": 3000,
        "max": 4500,
        "currency": "EUR"
      },
      "location": {
        "address": "25 Avenue des Champs-Élysées, Salon",
        "city": "Paris",
        "postalCode": "75008"
      },
      "status": "assigned",
      "assignedWorkerId": "worker-1",
      "assignee": {
        "id": "worker-1",
        "name": "Jean Dubois",
        "specialty": "Électricité",
        "rating": 4.8,
        "jobs": 127,
        "type": "artisan",
        "location": "Paris et région",
        "description": "Électricien qualifié avec 15 ans d'expérience",
        "experience": "120+ ans",
        "certifications": ["Qualification électricien", "Assurance décennale"],
        "availability": "Disponible",
        "responseTime": "Répond en moyenne en 2h",
        "completedProjects": 127,
        "specialties": ["installation électrique", "dépannage", "mise aux normes"],
        "status": "available"
      },
      "createdAt": "2024-03-18T11:20:00Z",
      "updatedAt": "2024-03-18T11:20:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### GET /api/requests/urgent

Get urgent and emergency requests.

**Request:**
```http
GET /api/requests/urgent
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "req-4",
      "title": "Panne de chauffage - URGENT",
      "urgency": "emergency",
      "status": "completed",
      "category": "Dépannage d'urgence"
    },
    {
      "id": "req-1",
      "title": "Fuite sous évier cuisine",
      "urgency": "high",
      "status": "assigned",
      "category": "Plomberie"
    }
  ]
}
```

## 🔧 Workers API

### GET /api/workers

List workers with advanced filtering.

**Query Parameters:**
- `skill` (optional): Filter by skill keyword
- `city` (optional): Filter by city
- `minRating` (optional): Minimum rating (1-5)
- `maxRate` (optional): Maximum hourly rate
- `available` (optional): Available only (`true`/`false`)
- `limit` (optional): Results per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Request:**
```http
GET /api/workers?skill=plomberie&minRating=4.5&available=true
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "worker-1",
      "firstName": "Jean",
      "lastName": "Dubois",
      "email": "jean.plombier@email.com",
      "skills": ["Plomberie", "Chauffage", "Installation sanitaire"],
      "rating": 4.8,
      "reviewCount": 127,
      "hourlyRate": 45,
      "availability": true,
      "location": {
        "city": "Paris",
        "postalCode": "75001",
        "radius": 25
      },
      "experience": 15,
      "completedProjects": 89
    }
  ],
  "pagination": {
    "total": 6,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### GET /api/workers/stats/overview

Get worker statistics.

**Request:**
```http
GET /api/workers/stats/overview
```

**Response (200):**
```json
{
  "data": {
    "total": 6,
    "available": 5,
    "averageRating": 4.6,
    "averageHourlyRate": 44.17,
    "totalReviews": 541,
    "totalProjects": 324
  }
}
```

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'client' | 'worker' | 'admin';
  createdAt: string;
  updatedAt: string;
}
```

### Worker Model
```typescript
interface Worker extends User {
  role: 'worker';
  bio?: string;
  skills: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: boolean;
  location: {
    city: string;
    postalCode: string;
    radius: number;
  };
  certifications?: string[];
  portfolio?: string[];
  completedProjects: number;
}
```

### Project Model
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  workerId?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
  timeline: {
    startDate?: string;
    endDate?: string;
    estimatedDuration: number;
  };
  images?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Service Request Model
```typescript
interface ServiceRequest {
  id: string;
  clientId: string;
  category: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
  preferredDate?: string;
  images?: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedWorkerId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🚨 Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token required"
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "Something went wrong on our end"
}
```

## 🔧 Testing the API

You can test these endpoints using:

1. **cURL commands** (as shown in examples above)
2. **Postman** or **Insomnia** REST clients
3. **Thunder Client** VS Code extension
4. Your frontend application

### Example cURL Commands

```bash
# Get all categories
curl -X GET "http://localhost:5000/api/categories"

# Get top-rated workers
curl -X GET "http://localhost:5000/api/workers/top-rated/list"

# Search workers by skill
curl -X GET "http://localhost:5000/api/workers?skill=plomberie"

# Get urgent requests
curl -X GET "http://localhost:5000/api/requests/urgent"
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Currency is currently set to EUR for all monetary values
- Image URLs in mock data point to placeholder services
- Pagination is implemented on list endpoints
- Authentication is mocked - tokens are generated but not validated in detail
- All data is currently mocked and stored in memory