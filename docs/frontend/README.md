# AlloObbrico Frontend

React-based frontend application for the AlloObbrico professional services marketplace.

## 📋 Overview

The frontend provides a modern, responsive user interface for clients and workers to interact with the AlloObbrico platform. Built with React 19, TypeScript, and Material-UI for a professional user experience.

## 🛠️ Technology Stack

- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Emotion (CSS-in-JS)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet with React-Leaflet
- **Build Tool**: Create React App
- **State Management**: React Context API
- **Icons**: Lucide React
- **Forms**: React Hook Form (planned)
- **Testing**: Jest + React Testing Library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AdminDashboard.tsx
│   │   ├── BusinessDashboard.tsx
│   │   ├── ClientDashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Logo.tsx
│   │   ├── WorkerDashboard.tsx
│   │   └── ErrorBoundary.tsx
│   ├── constants/         # Application constants
│   │   └── index.ts       # API URLs, config values
│   ├── hooks/             # Custom React hooks
│   │   └── index.ts       # Custom hooks for data fetching
│   ├── types/             # Frontend type definitions
│   │   └── index.ts       # TypeScript interfaces
│   ├── utils/             # Utility functions
│   │   └── index.ts       # Helper functions
│   ├── styles.css         # Global styles
│   ├── theme.ts           # MUI theme configuration
│   ├── App.tsx            # Main application component
│   ├── App.css            # App-specific styles
│   ├── App.test.tsx       # App component tests
│   ├── index.tsx          # Application entry point
│   ├── index.css          # Global CSS
│   ├── logo.svg           # Application logo
│   ├── react-app-env.d.ts # TypeScript declarations
│   ├── reportWebVitals.ts # Performance monitoring
│   └── setupTests.ts      # Test configuration
├── public/                # Static assets
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── tests/                 # Test files (planned)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Backend API running (see backend documentation)

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (not recommended)
npm run eject
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPS_API_KEY=your-maps-api-key
REACT_APP_ENVIRONMENT=development
```

## 🎨 UI Components

### Dashboard Components

#### ClientDashboard
Main dashboard for clients to:
- View active projects
- Browse service categories
- Create new service requests
- Track project progress
- View past projects and reviews

#### WorkerDashboard
Main dashboard for workers to:
- View available requests
- Manage active projects
- Update availability status
- Track earnings and reviews
- Manage profile and portfolio

#### AdminDashboard
Administrative dashboard for:
- Platform overview and analytics
- User management
- Category management
- Dispute resolution
- System monitoring

#### BusinessDashboard
Dashboard for business accounts to:
- Manage multiple projects
- Team coordination
- Bulk service requests
- Invoice management

### Shared Components

#### Login
Authentication component with:
- Email/password login
- Registration form
- Password reset functionality
- Social login options (planned)

#### ErrorBoundary
Error handling component that:
- Catches JavaScript errors
- Displays user-friendly error messages
- Reports errors for debugging
- Provides recovery options

#### Loading
Loading state component with:
- Skeleton screens
- Progress indicators
- Loading messages

## 🎯 Key Features

### User Authentication
- JWT-based authentication
- Secure login/logout flow
- Password reset functionality
- Role-based access control

### Service Discovery
- Category browsing with icons
- Search and filter capabilities
- Worker profiles with ratings
- Portfolio galleries
- Availability indicators

### Project Management
- Request creation with details
- Real-time status updates
- Progress tracking
- File upload for images
- Communication tools

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Accessible design (WCAG compliant)
- Dark/light theme support (planned)

### Maps Integration
- Location-based search
- Service area visualization
- Address autocomplete
- Distance calculations

## 🔧 Development Guidelines

### Component Structure
```typescript
// Example component structure
import React from 'react';
import { Box, Typography } from '@mui/material';

interface ComponentProps {
  title: string;
  data?: SomeDataType;
}

const Component: React.FC<ComponentProps> = ({ title, data }) => {
  return (
    <Box>
      <Typography variant="h4">{title}</Typography>
      {/* Component content */}
    </Box>
  );
};

export default Component;
```

### State Management
Currently using React Context API. For larger applications, consider:
- Redux Toolkit
- Zustand
- React Query for server state

### API Integration
```typescript
// Example API service
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const apiService = {
  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  },

  getWorkers: async (params?: WorkerFilters) => {
    const response = await axios.get(`${API_BASE_URL}/workers`, { params });
    return response.data;
  }
};
```

### Styling Guidelines
- Use Material-UI theme system
- Consistent spacing using theme.spacing()
- Responsive breakpoints
- Custom theme extensions in `theme.ts`

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
```typescript
// Example test file
import React from 'react';
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Build is created in 'build' directory
# Ready for deployment to any static hosting service
```

### Deployment Options
- **Netlify**: Drag & drop build folder
- **Vercel**: Connect GitHub repository
- **AWS S3 + CloudFront**: Static website hosting
- **Docker**: Containerized deployment

### Environment Configuration
- Development: `npm start`
- Production: Serve built files
- Staging: Separate environment variables

## 📱 Progressive Web App (PWA)

The application includes PWA features:
- Service worker for offline capability
- Web app manifest
- Installable on mobile devices
- Push notifications (planned)

## 🔍 Performance Optimization

### Code Splitting
- Route-based code splitting with React.lazy()
- Component lazy loading
- Bundle analysis with `npm run build`

### Image Optimization
- Responsive images
- WebP format support
- Lazy loading
- CDN integration (planned)

### Caching Strategy
- Service worker caching
- API response caching
- Static asset caching

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management

## 🔄 Future Enhancements

### Planned Features
- [ ] Real-time chat between clients and workers
- [ ] Push notifications
- [ ] Advanced search with filters
- [ ] Payment integration
- [ ] Review and rating system
- [ ] File upload for project documentation
- [ ] Calendar integration for scheduling
- [ ] Multi-language support (i18n)
- [ ] Dark/light theme toggle

### Technical Improvements
- [ ] State management migration (Redux Toolkit/Zustand)
- [ ] React Query for server state management
- [ ] Component library extraction
- [ ] Storybook for component documentation
- [ ] End-to-end testing with Cypress
- [ ] Performance monitoring
- [ ] Error tracking and reporting

## 📞 Support

For frontend-related questions:
- Check component documentation
- Review the TypeScript types
- Test components in isolation
- Create an issue for bugs or feature requests

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new components
3. Update documentation
4. Ensure responsive design
5. Test accessibility features

---

**Built with ❤️ for the AlloObbrico community**