import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AlloBrico app', () => {
  render(<App />);
  const headingElement = screen.getByText(/AlloBrico/i);
  expect(headingElement).toBeInTheDocument();
});
