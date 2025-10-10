// User types
export interface User {
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

export interface Client extends User {
  role: 'client';
  address?: string;
  preferences?: string[];
}

export interface Worker extends User {
  role: 'worker';
  bio?: string;
  skills: string[];
  experience: number; // years
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: boolean;
  location: {
    city: string;
    postalCode: string;
    radius: number; // km
  };
  certifications?: string[];
  portfolio?: string[];
  completedProjects: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories?: string[];
  popular: boolean;
}

// Project types
export interface Project {
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
    estimatedDuration: number; // days
  };
  images?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface ServiceRequest {
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

// Review types
export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  projectId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}