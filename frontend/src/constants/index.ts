// Application configuration
export const APP_CONFIG = {
  name: 'AllobBrico',
  version: '1.0.0',
  description: 'Plateforme de mise en relation pour services de bricolage',
  contact: {
    email: 'contact@allobbrico.fr',
    phone: '+33 1 23 45 67 89',
  },
};

// API configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  retries: 3,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      register: '/api/auth/register',
      refresh: '/api/auth/refresh',
      profile: '/api/auth/profile',
    },
    users: {
      base: '/api/users',
      profile: '/api/users/profile',
      update: '/api/users/update',
    },
    workers: {
      base: '/api/workers',
      search: '/api/workers/search',
      profile: '/api/workers/profile',
      reviews: '/api/workers/reviews',
    },
    requests: {
      base: '/api/requests',
      create: '/api/requests/create',
      update: '/api/requests/update',
      cancel: '/api/requests/cancel',
      accept: '/api/requests/accept',
    },
    categories: {
      base: '/api/categories',
      list: '/api/categories/list',
    },
    notifications: {
      base: '/api/notifications',
      markRead: '/api/notifications/mark-read',
      markAllRead: '/api/notifications/mark-all-read',
    },
  },
};

// User roles and permissions
export const USER_ROLES = {
  CLIENT: 'client',
  WORKER: 'worker',
  BUSINESS: 'business',
  ADMIN: 'admin',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.CLIENT]: [
    'create_request',
    'view_own_requests',
    'rate_worker',
    'message_worker',
  ],
  [USER_ROLES.WORKER]: [
    'view_requests',
    'accept_request',
    'complete_request',
    'message_client',
    'update_profile',
  ],
  [USER_ROLES.BUSINESS]: [
    'manage_workers',
    'view_analytics',
    'manage_requests',
    'view_all_requests',
  ],
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_categories',
    'view_system_analytics',
    'moderate_content',
  ],
} as const;

// Service request statuses
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: 'En attente',
  [REQUEST_STATUS.ACCEPTED]: 'Acceptée',
  [REQUEST_STATUS.IN_PROGRESS]: 'En cours',
  [REQUEST_STATUS.COMPLETED]: 'Terminée',
  [REQUEST_STATUS.CANCELLED]: 'Annulée',
  [REQUEST_STATUS.REJECTED]: 'Refusée',
} as const;

export const REQUEST_STATUS_COLORS = {
  [REQUEST_STATUS.PENDING]: '#f59e0b',
  [REQUEST_STATUS.ACCEPTED]: '#10b981',
  [REQUEST_STATUS.IN_PROGRESS]: '#3b82f6',
  [REQUEST_STATUS.COMPLETED]: '#059669',
  [REQUEST_STATUS.CANCELLED]: '#ef4444',
  [REQUEST_STATUS.REJECTED]: '#dc2626',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.INFO]: 'info-circle',
  [NOTIFICATION_TYPES.SUCCESS]: 'check-circle',
  [NOTIFICATION_TYPES.WARNING]: 'alert-triangle',
  [NOTIFICATION_TYPES.ERROR]: 'x-circle',
} as const;

// Service categories
export const SERVICE_CATEGORIES = {
  PLUMBING: 'plomberie',
  ELECTRICAL: 'electricite',
  PAINTING: 'peinture',
  CARPENTRY: 'menuiserie',
  CLEANING: 'nettoyage',
  GARDENING: 'jardinage',
  MOVING: 'demenagement',
  ASSEMBLY: 'montage',
  RENOVATION: 'renovation',
  MAINTENANCE: 'maintenance',
} as const;

export const CATEGORY_LABELS = {
  [SERVICE_CATEGORIES.PLUMBING]: 'Plomberie',
  [SERVICE_CATEGORIES.ELECTRICAL]: 'Électricité',
  [SERVICE_CATEGORIES.PAINTING]: 'Peinture',
  [SERVICE_CATEGORIES.CARPENTRY]: 'Menuiserie',
  [SERVICE_CATEGORIES.CLEANING]: 'Nettoyage',
  [SERVICE_CATEGORIES.GARDENING]: 'Jardinage',
  [SERVICE_CATEGORIES.MOVING]: 'Déménagement',
  [SERVICE_CATEGORIES.ASSEMBLY]: 'Montage',
  [SERVICE_CATEGORIES.RENOVATION]: 'Rénovation',
  [SERVICE_CATEGORIES.MAINTENANCE]: 'Maintenance',
} as const;

export const CATEGORY_ICONS = {
  [SERVICE_CATEGORIES.PLUMBING]: 'wrench',
  [SERVICE_CATEGORIES.ELECTRICAL]: 'zap',
  [SERVICE_CATEGORIES.PAINTING]: 'palette',
  [SERVICE_CATEGORIES.CARPENTRY]: 'hammer',
  [SERVICE_CATEGORIES.CLEANING]: 'spray-can',
  [SERVICE_CATEGORIES.GARDENING]: 'flower',
  [SERVICE_CATEGORIES.MOVING]: 'truck',
  [SERVICE_CATEGORIES.ASSEMBLY]: 'settings',
  [SERVICE_CATEGORIES.RENOVATION]: 'home',
  [SERVICE_CATEGORIES.MAINTENANCE]: 'tool',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: 'Ce champ est requis',
  email: 'Veuillez entrer une adresse email valide',
  phone: 'Veuillez entrer un numéro de téléphone valide',
  password:
    'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  passwordConfirm: 'Les mots de passe ne correspondent pas',
  minLength: (min: number) =>
    `Ce champ doit contenir au moins ${min} caractères`,
  maxLength: (max: number) => `Ce champ ne peut pas dépasser ${max} caractères`,
  min: (min: number) => `La valeur doit être supérieure ou égale à ${min}`,
  max: (max: number) => `La valeur doit être inférieure ou égale à ${max}`,
  postalCode: 'Veuillez entrer un code postal valide (5 chiffres)',
  url: 'Veuillez entrer une URL valide',
  fileSize: (maxSize: string) =>
    `La taille du fichier ne peut pas dépasser ${maxSize}`,
  fileType: 'Type de fichier non autorisé',
};

// UI Constants
export const UI_CONSTANTS = {
  headerHeight: '80px',
  sidebarWidth: '280px',
  mobileBreakpoint: '768px',
  tabletBreakpoint: '1024px',
  desktopBreakpoint: '1280px',
  maxContentWidth: '1200px',
  cardBorderRadius: '12px',
  buttonBorderRadius: '8px',
  inputBorderRadius: '6px',
  animationDuration: '0.2s',
  shadowLow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  shadowMedium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  shadowHigh: '0 10px 25px rgba(0, 0, 0, 0.15)',
};

// Storage keys
export const STORAGE_KEYS = {
  user: 'allobbrico_user',
  token: 'allobbrico_token',
  refreshToken: 'allobbrico_refresh_token',
  preferences: 'allobbrico_preferences',
  theme: 'allobbrico_theme',
  language: 'allobbrico_language',
  recentSearches: 'allobbrico_recent_searches',
  cart: 'allobbrico_cart',
} as const;

// Default values
export const DEFAULT_VALUES = {
  pagination: {
    page: 1,
    limit: 20,
  },
  image: {
    placeholder: '/images/placeholder.jpg',
    avatar: '/images/default-avatar.png',
  },
  coordinates: {
    lat: 48.8566, // Paris
    lng: 2.3522,
  },
  currency: 'EUR',
  locale: 'fr-FR',
  timezone: 'Europe/Paris',
};

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0,
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  profileUpdated: 'Profil mis à jour avec succès',
  requestCreated: 'Demande créée avec succès',
  requestUpdated: 'Demande mise à jour avec succès',
  requestCancelled: 'Demande annulée avec succès',
  passwordChanged: 'Mot de passe modifié avec succès',
  emailVerified: 'Email vérifié avec succès',
  messagesSent: 'Message envoyé avec succès',
  fileUploaded: 'Fichier téléchargé avec succès',
  settingsSaved: 'Paramètres sauvegardés avec succès',
};

// Error messages
export const ERROR_MESSAGES = {
  generic: "Une erreur inattendue s'est produite",
  network: 'Erreur de connexion réseau',
  unauthorized: "Vous n'êtes pas autorisé à effectuer cette action",
  notFound: 'Ressource non trouvée',
  validation: 'Données invalides',
  server: 'Erreur serveur interne',
  timeout: "Délai d'attente dépassé",
  fileUpload: 'Erreur lors du téléchargement du fichier',
  emailExists: 'Cette adresse email est déjà utilisée',
  invalidCredentials: 'Identifiants incorrects',
  sessionExpired: 'Session expirée, veuillez vous reconnecter',
};

// Feature flags
export const FEATURE_FLAGS = {
  enableNotifications: true,
  enableChat: true,
  enableGeolocation: true,
  enablePayments: false,
  enableReviews: true,
  enableAnalytics: true,
  enableMultipleImages: true,
  enableVideoCall: false,
  enablePushNotifications: false,
} as const;

// Social media links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/allobbrico',
  twitter: 'https://twitter.com/allobbrico',
  instagram: 'https://instagram.com/allobbrico',
  linkedin: 'https://linkedin.com/company/allobbrico',
  youtube: 'https://youtube.com/allobbrico',
} as const;

// Legal pages
export const LEGAL_LINKS = {
  privacyPolicy: '/legal/privacy-policy',
  termsOfService: '/legal/terms-of-service',
  cookiePolicy: '/legal/cookie-policy',
  legalNotice: '/legal/legal-notice',
} as const;

// File upload constraints
export const FILE_CONSTRAINTS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxFiles: 3,
  },
} as const;
