import { create } from 'zustand';
import { authService, categoryService, workerService, requestService } from '../utils';

// Auth Store
interface AuthState {
  isLoggedIn: boolean;
  userRole: string;
  user: any | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUserRole: (role: string) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userRole: 'client',
  user: null,
  login: async (email: string, password: string, role: string) => {
    try {
      const response = await authService.login(email, password, role);
      set({ isLoggedIn: true, userRole: role, user: response });
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    set({ isLoggedIn: false, userRole: 'client', user: null });
  },
  setUserRole: (role: string) => set({ userRole: role }),
  setIsLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
}));

// Categories Store
interface CategoriesState {
  categories: any[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await categoryService.getCategories();
      set({ categories: (response as any)?.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load categories', loading: false });
      throw error; // Don't use fallback mock data
    }
  },
}));

// Workers Store
interface WorkersState {
  workers: any[];
  loading: boolean;
  error: string | null;
  fetchWorkers: () => Promise<void>;
  searchWorkers: (query: string, filters?: any) => Promise<void>;
}

export const useWorkersStore = create<WorkersState>((set) => ({
  workers: [],
  loading: false,
  error: null,
  fetchWorkers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await workerService.getWorkers();
      set({ workers: (response as any)?.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load workers', loading: false });
      throw error; // Don't use fallback mock data
    }
  },
  searchWorkers: async (query: string, filters?: any) => {
    set({ loading: true, error: null });
    try {
      const response = await workerService.getWorkers({ q: query, ...filters });
      set({ workers: (response as any)?.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to search workers', loading: false });
    }
  },
}));

// Requests Store
interface RequestsState {
  requests: any[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  createRequest: (requestData: any) => Promise<void>;
}

export const useRequestsStore = create<RequestsState>((set) => ({
  requests: [],
  loading: false,
  error: null,
  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await requestService.getRequests();
      set({ requests: (response as any)?.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load requests', loading: false });
      throw error; // Don't use fallback mock data
    }
  },
  createRequest: async (requestData: any) => {
    set({ loading: true, error: null });
    try {
      await requestService.createRequest(requestData);
      // Refresh requests after creating
      const response = await requestService.getRequests();
      set({ requests: (response as any)?.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to create request', loading: false });
      throw error;
    }
  },
}));