// Type definitions for better type safety
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'worker' | 'business' | 'admin';
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

export interface Worker {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  jobs: number;
  type: 'artisan' | 'company' | 'individual';
  urgent: boolean;
  location?: string;
  description?: string;
  experience?: string;
  certifications?: string[];
  portfolio?: any[];
  reviews?: any[];
  availability?: string;
  responseTime?: string;
  completedProjects?: number;
  specialties?: string[];
  status: 'available' | 'busy' | 'active' | 'inactive' | 'suspended';
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isUrgent: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  clientId: string;
  workerId?: string;
  createdAt: string;
  updatedAt: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  offers?: Offer[];
}

export interface Offer {
  id: string;
  workerId: string;
  requestId: string;
  price: number;
  message: string;
  estimatedDuration: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation schemas (Zod-like structure)
export interface LoginFormData {
  email: string;
  password: string;
  userRole: User['role'];
}

export interface ServiceRequestFormData {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  isUrgent: boolean;
  budget?: {
    min: number;
    max: number;
  };
}

// Component prop interfaces
export interface DashboardProps {
  user: User;
  notifications: Notification[];
}

export interface SearchFilters {
  location?: string;
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: 'immediate' | 'this-week' | 'this-month';
  type?: Worker['type'];
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  workerId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  progress: number;
  milestones: Milestone[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  completedAt?: string;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  description: string;
  photos: string[];
  timestamp: string;
  milestoneId?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  beforeImages?: string[];
  afterImages?: string[];
  completionDate: string;
  clientRating?: number;
  clientReview?: string;
}
