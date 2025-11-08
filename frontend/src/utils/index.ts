// Date formatting utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;
  if (diffInDays < 7) return `Il y a ${diffInDays} j`;

  return formatDate(dateString);
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Number formatting utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number);
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;

  const cloned = {} as T;
  Object.keys(obj).forEach((key) => {
    cloned[key as keyof T] = deepClone((obj as any)[key]);
  });

  return cloned;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex =
    /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

// URL and navigation utilities
export const buildQueryString = (
  params: Record<string, string | number | boolean>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const parseQueryString = (
  queryString: string
): Record<string, string> => {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Color utilities
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Storage utilities
export const safeJSONParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const safeJSONStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
};

// Error handling utilities
export const createErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inconnue est survenue';
};

export const logError = (error: unknown, context?: string): void => {
  const message = createErrorMessage(error);
  const logMessage = context ? `[${context}] ${message}` : message;

  console.error(logMessage, error);

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
  }
};

// Simple API helper
const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');
console.log('API_BASE:', API_BASE);

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

const request = async <T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: any
): Promise<T> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`API request failed: ${method} ${API_BASE}${path}`, error);
    throw error;
  }
};

export const api = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: any) => request<T>(path, 'POST', body),
  patch: <T>(path: string, body?: any) => request<T>(path, 'PATCH', body),
  put: <T>(path: string, body?: any) => request<T>(path, 'PUT', body),
  delete: <T>(path: string) => request<T>(path, 'DELETE'),
};

// API Service Functions
export const authService = {
  login: (email: string, password: string, role: string) =>
    api.post('/auth/login', { email, password, role }),
  register: (userData: { email: string; password: string; firstName: string; lastName: string; role: string; }) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const userService = {
  getUsers: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/users${queryString}`);
  },
  getUserById: (id: string) => api.get(`/users/${id}`),
  getTopRatedWorkers: () => api.get('/users/workers/top-rated'),
  getAvailableWorkers: () => api.get('/users/workers/available'),
  searchWorkers: (query: string, filters?: Record<string, any>) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get(`/users/workers/search?${params.toString()}`);
  },
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id: string) => api.get(`/categories/${id}`),
  getPopularCategories: () => api.get('/categories/popular'),
  searchCategories: (query: string) => api.get(`/categories/search?q=${query}`),
};

export const workerService = {
  getWorkers: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/workers${queryString}`);
  },
  getWorkerById: (id: string) => api.get(`/workers/${id}`),
  getTopRatedWorkers: () => api.get('/workers/top-rated/list'),
  getAvailableWorkers: () => api.get('/workers/available/list'),
  getWorkerStats: () => api.get('/workers/stats/overview'),
  getWorkersBySkill: (skill: string) => api.get(`/workers/skill/${skill}`),
  getWorkersByLocation: (city: string) => api.get(`/workers/location/${city}`),
  getWorkerRequests: (workerId: string) => api.get(`/workers/${workerId}/requests`),
  acceptRequest: (requestId: string) => api.patch(`/requests/${requestId}/status`, { status: 'accepted' }),
  getWorkerPortfolio: (workerId: string) => api.get(`/projects/workers/${workerId}/portfolio`),
  addPortfolioItem: (workerId: string, portfolioData: FormData) =>
    fetch(`${API_BASE}/projects/workers/${workerId}/portfolio`, {
      method: 'POST',
      body: portfolioData,
    }).then(res => res.json()),
};

export const projectService = {
  getProjects: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/projects${queryString}`);
  },
  getProjectById: (id: string) => api.get(`/projects/${id}`),
  getProjectStats: () => api.get('/projects/stats/overview'),
  getRecentProjects: () => api.get('/projects/recent/list'),
  getProjectsByCategory: (category: string) => api.get(`/projects/category/${category}`),
  getWorkerProjects: (workerId: string) => api.get(`/projects?workerId=${workerId}`),
  addProgressUpdate: (projectId: string, progressData: FormData) =>
    fetch(`${API_BASE}/projects/${projectId}/progress`, {
      method: 'POST',
      body: progressData,
    }).then(res => res.json()),
  getProgressUpdates: (projectId: string) => api.get(`/projects/${projectId}/progress`),
  completeMilestone: (projectId: string, milestoneId: string) =>
    api.patch(`/projects/${projectId}/milestones/${milestoneId}/complete`),
};

export const requestService = {
  getRequests: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/requests${queryString}`);
  },
  getRequestById: (id: string) => api.get(`/requests/${id}`),
  getUrgentRequests: () => api.get('/requests/urgent/list'),
  getRequestStats: () => api.get('/requests/stats/overview'),
  getRecentRequests: () => api.get('/requests/recent/list'),
  getRequestsByCategory: (category: string) => api.get(`/requests/category/${category}`),
  createRequest: (requestData: any) => api.post('/requests', requestData),
  updateRequest: (id: string, requestData: any) => api.put(`/requests/${id}`, requestData),
  deleteRequest: (id: string) => api.delete(`/requests/${id}`),
};

export const adminService = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),

  // User validation management
  getPendingUsers: (params?: { status?: string; type?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/admin/pending-users${queryString}`);
  },
  getPendingUserById: (id: number) => api.get(`/admin/pending-users/${id}`),
  approveUser: (id: number, notes?: string) => api.post(`/admin/pending-users/${id}/approve`, { notes }),
  rejectUser: (id: number, reason: string, notes?: string) => api.post(`/admin/pending-users/${id}/reject`, { reason, notes }),

  // Reports management
  getReports: (params?: { status?: string; priority?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/admin/reports${queryString}`);
  },
  getReportById: (id: number) => api.get(`/admin/reports/${id}`),
  updateReportStatus: (id: number, status: string, notes?: string, resolution?: string) =>
    api.put(`/admin/reports/${id}/status`, { status, notes, resolution }),

  // Requests management
  getRequests: (params?: { status?: string; priority?: string; service?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/admin/requests${queryString}`);
  },
  getRequestById: (id: number) => api.get(`/admin/requests/${id}`),
  updateRequestStatus: (id: number, status: string, notes?: string) =>
    api.put(`/admin/requests/${id}/status`, { status, notes }),
  assignRequest: (id: number, workerId: number, notes?: string) =>
    api.put(`/admin/requests/${id}/assign`, { workerId, notes }),

  // User management
  getUsers: (params?: { role?: string; status?: string; search?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/admin/users${queryString}`);
  },
  updateUserStatus: (id: number, status: string, reason?: string) =>
    api.put(`/admin/users/${id}/status`, { status, reason }),

  // Analytics
  getAnalytics: (period?: string) => {
    const queryString = period ? `?period=${period}` : '';
    return api.get(`/admin/analytics${queryString}`);
  },

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings: any) => api.put('/admin/settings', settings),
};

// Map worker specialties to category icons
export const getCategoryIcon = (specialty: string | null): string => {
  if (!specialty) return '👷'; // Default icon for null/undefined specialty

  const specialtyLower = specialty.toLowerCase();

  if (specialtyLower.includes('plomberie') || specialtyLower.includes('chauffage')) {
    return '🔧';
  }
  if (specialtyLower.includes('électricité') || specialtyLower.includes('domotique')) {
    return '⚡';
  }
  if (specialtyLower.includes('peinture') || specialtyLower.includes('décoration')) {
    return '🎨';
  }
  if (specialtyLower.includes('menuiserie') || specialtyLower.includes('ébénisterie')) {
    return '🔨';
  }
  if (specialtyLower.includes('jardinage') || specialtyLower.includes('paysagiste')) {
    return '🌱';
  }
  if (specialtyLower.includes('ménage') || specialtyLower.includes('nettoyage')) {
    return '🧹';
  }
  if (specialtyLower.includes('réparation') || specialtyLower.includes('maintenance')) {
    return '🔧';
  }

  // Default icon
  return '👷';
};

// Generate realistic coordinates based on location
export const getLocationCoordinates = (location: any): [number, number] => {
  const locationString = getLocationString(location);
  const locationLower = locationString.toLowerCase();

  // Paris coordinates as base
  const baseLat = 48.8566;
  const baseLng = 2.3522;

  // Add some variation based on arrondissement or city
  if (locationLower.includes('15ème') || locationLower.includes('15e')) {
    return [baseLat - 0.02, baseLng - 0.01];
  }
  if (locationLower.includes('boulogne')) {
    return [baseLat + 0.03, baseLng - 0.02];
  }
  if (locationLower.includes('neuilly')) {
    return [baseLat + 0.02, baseLng - 0.03];
  }
  if (locationLower.includes('versailles')) {
    return [baseLat - 0.05, baseLng + 0.02];
  }

  // Random variation for other locations
  const variation = 0.05;
  return [
    baseLat + (Math.random() - 0.5) * variation,
    baseLng + (Math.random() - 0.5) * variation,
  ];
};

export const messageService = {
  // Conversations
  getConversations: () => api.get('/messages/conversations'),
  getConversationMessages: (conversationId: string) => api.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string) => api.post(`/messages/conversations/${conversationId}/messages`, { content }),
  createConversation: (participantId: string, initialMessage?: string) => api.post('/messages/conversations', { participantId, initialMessage }),
};

// Notifications service (real backend integration)
// Shapes returned by backend: { id, type, title, message, payload, is_read, created_at }
// We keep a lightweight transformer in the App component for UI formatting.
export const notificationsService = {
  getNotifications: (limit: number = 50) => api.get<{ notifications: any[] }>(`/notifications?limit=${limit}`),
  markRead: (id: string | number) => api.patch<{ notification: any }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ success: boolean }>(`/notifications/read-all`),
};

// Utility function to safely get location string from various formats
export const getLocationString = (location: any): string => {
  if (typeof location === 'string') {
    return location;
  }
  if (location && typeof location === 'object') {
    return location.address || location.city || 'N/A';
  }
  return 'N/A';
};
