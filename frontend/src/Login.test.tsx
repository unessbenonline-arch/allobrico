import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './components/Login';

// Mock the auth service
jest.mock('./utils', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock the theme context
jest.mock('./contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

describe('Login Component', () => {
  const mockProps = {
    email: 'test@example.com',
    setEmail: jest.fn(),
    password: 'password123',
    setPassword: jest.fn(),
    userRole: 'client',
    setUserRole: jest.fn(),
    isLoggedIn: false,
    setIsLoggedIn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all required fields', () => {
    render(<Login {...mockProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('displays role selection', () => {
    render(<Login {...mockProps} />);

    expect(screen.getByLabelText('Type de compte')).toBeInTheDocument();
  });

  test('calls login function when form is submitted', async () => {
    const { authService } = require('./utils');
    authService.login.mockResolvedValue({ user: { id: '1', name: 'Test User' } });

    render(<Login {...mockProps} />);

    const loginButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123', 'client');
    });
  });

  test('shows demo login buttons', () => {
    render(<Login {...mockProps} />);

    expect(screen.getByText('Accès démo instantané')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /artisan/i })).toBeInTheDocument();
  });

  test('demo login buttons call setIsLoggedIn', () => {
    render(<Login {...mockProps} />);

    const clientDemoButton = screen.getByRole('button', { name: /client/i });
    fireEvent.click(clientDemoButton);

    expect(mockProps.setUserRole).toHaveBeenCalledWith('client');
    expect(mockProps.setIsLoggedIn).toHaveBeenCalledWith(true);
  });

  test('forgot password dialog can be opened', () => {
    render(<Login {...mockProps} />);

    const forgotPasswordLink = screen.getByText(/mot de passe oublié/i);
    fireEvent.click(forgotPasswordLink);

    expect(screen.getByText('Réinitialiser le mot de passe')).toBeInTheDocument();
  });
});