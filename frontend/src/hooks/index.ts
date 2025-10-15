import { useState, useCallback, useEffect } from 'react';
import { User, Notification, ServiceRequest, Worker } from '../types';

// Authentication hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string, role: User['role']) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name:
            role === 'client'
              ? 'Marie Dupont'
              : role === 'worker'
                ? 'Pierre Martin'
                : role === 'business'
                  ? 'TechPro Services'
                  : 'Admin AllobBrico',
          role,
          avatar:
            role === 'client'
              ? 'MD'
              : role === 'worker'
                ? 'PM'
                : role === 'business'
                  ? 'TP'
                  : 'AA',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } catch (err) {
        setError('Erreur de connexion. Veuillez vérifier vos identifiants.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const switchRole = useCallback(
    (role: User['role']) => {
      if (user) {
        const updatedUser = { ...user, role };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    },
    [user]
  );

  // Initialize auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    switchRole,
    isAuthenticated: !!user,
  };
};

// Notifications hook
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Nouvelle demande de devis reçue',
      type: 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: '2',
      message: 'Projet terminé avec succès',
      type: 'success',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
    },
  ]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  };
};

// Local storage hook with type safety
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};

// Debounced search hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback(
    (fieldName?: keyof T) => {
      const fieldsToValidate = fieldName
        ? [fieldName]
        : (Object.keys(validationRules) as (keyof T)[]);
      const newErrors: Partial<Record<keyof T, string>> = { ...errors };

      fieldsToValidate.forEach((field) => {
        const error = validationRules[field]?.(values[field]);
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [values, errors, validationRules]
  );

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        // Validate immediately if field was already touched
        setTimeout(() => validate(field), 0);
      }
    },
    [touched, validate]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validate(field);
    },
    [validate]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    touched,
    isValid,
    hasErrors,
    handleChange,
    handleBlur,
    validate,
    reset,
  };
};

// API hook with loading and error states
export const useApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    refetch();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
