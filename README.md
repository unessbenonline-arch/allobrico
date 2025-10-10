# AlloObbrico FullStack

A full-stack web application for the AlloObbrico platform connecting clients with skilled workers for home improvement projects.

## Project Structure

```
allobbrico-fullstack/
├── backend/          # Node.js/Express backend API
├── frontend/         # React frontend application
├── database/         # Database initialization scripts
├── docker/           # Docker configuration files
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (optional, for containerized development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd allobbrico-fullstack
```

2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or start them individually:
```bash
# Backend only
npm run backend:dev

# Frontend only
npm run frontend:dev
```

### Building for Production

```bash
npm run build
```

### Docker Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment

```bash
docker-compose up
```

## Features

- User authentication and authorization
- Client dashboard for project management
- Worker dashboard for job applications
- Business dashboard for service providers
- Admin panel for platform management
- Real-time notifications
- File upload and management
- Responsive design

## Technology Stack

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication

### Frontend
- React
- TypeScript
- Material-UI / Styled Components
- React Router
- Axios

### DevOps
- Docker
- Docker Compose
- Nginx

## License

This project is licensed under the ISC License.