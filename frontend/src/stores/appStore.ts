import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService, requestService, categoryService, workerService } from '../utils';
import { User, ServiceRequest, Worker, Category } from '../types';

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Data state
  requests: ServiceRequest[];
  categories: Category[];
  workers: Worker[];
  currentRequest: ServiceRequest | null;

  // UI state
  isLoadingRequests: boolean;
  isLoadingCategories: boolean;
  isLoadingWorkers: boolean;

  // Actions
  login: (email: string, password: string, role: User['role']) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;

  // Data actions
  fetchRequests: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchWorkers: () => Promise<void>;
  createRequest: (requestData: Partial<ServiceRequest>) => Promise<void>;
  updateRequest: (id: string, updates: Partial<ServiceRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;

  // UI actions
  setCurrentRequest: (request: ServiceRequest | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      requests: [],
      categories: [],
      workers: [],
      currentRequest: null,

      isLoadingRequests: false,
      isLoadingCategories: false,
      isLoadingWorkers: false,

      // Auth actions
      login: async (email: string, password: string, role: User['role']) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password, role) as { user: User };
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false
          });
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          requests: [],
          currentRequest: null
        });
        localStorage.removeItem('user');
      },

      register: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData) as { user: User };
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      // Data actions
      fetchRequests: async () => {
        set({ isLoadingRequests: true, error: null });
        try {
          const response = await requestService.getRequests() as { data: ServiceRequest[] };
          set({
            requests: response.data || [],
            isLoadingRequests: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch requests',
            isLoadingRequests: false
          });
          throw error;
        }
      },

      fetchCategories: async () => {
        set({ isLoadingCategories: true, error: null });
        try {
          const response = await categoryService.getCategories() as { data: Category[] };
          set({
            categories: response.data || [],
            isLoadingCategories: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            isLoadingCategories: false
          });
          throw error;
        }
      },

      fetchWorkers: async () => {
        set({ isLoadingWorkers: true, error: null });
        try {
          const response = await workerService.getWorkers() as { data: Worker[] };
          set({
            workers: response.data || [],
            isLoadingWorkers: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch workers',
            isLoadingWorkers: false
          });
          throw error;
        }
      },

      createRequest: async (requestData: Partial<ServiceRequest>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await requestService.createRequest(requestData) as { data: ServiceRequest };
          const newRequest = response.data;
          set(state => ({
            requests: [newRequest, ...state.requests],
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create request',
            isLoading: false
          });
          throw error;
        }
      },

      updateRequest: async (id: string, updates: Partial<ServiceRequest>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await requestService.updateRequest(id, updates) as { data: ServiceRequest };
          const updatedRequest = response.data;
          set(state => ({
            requests: state.requests.map(req =>
              req.id === id ? updatedRequest : req
            ),
            currentRequest: state.currentRequest?.id === id ? updatedRequest : state.currentRequest,
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update request',
            isLoading: false
          });
          throw error;
        }
      },

      deleteRequest: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await requestService.deleteRequest(id);
          set(state => ({
            requests: state.requests.filter(req => req.id !== id),
            currentRequest: state.currentRequest?.id === id ? null : state.currentRequest,
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete request',
            isLoading: false
          });
          throw error;
        }
      },

      // UI actions
      setCurrentRequest: (request: ServiceRequest | null) => {
        set({ currentRequest: request });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'allobbrico-store',
    }
  )
);

// Selectors
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, register } = useAppStore();
  return { user, isAuthenticated, isLoading, error, login, logout, register };
};

export const useRequests = () => {
  const {
    requests,
    currentRequest,
    isLoadingRequests,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    setCurrentRequest
  } = useAppStore();
  return {
    requests,
    currentRequest,
    isLoading: isLoadingRequests,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    setCurrentRequest
  };
};

export const useCategories = () => {
  const { categories, isLoadingCategories, fetchCategories } = useAppStore();
  return { categories, isLoading: isLoadingCategories, fetchCategories };
};

export const useWorkers = () => {
  const { workers, isLoadingWorkers, fetchWorkers } = useAppStore();
  return { workers, isLoading: isLoadingWorkers, fetchWorkers };
};