import { test, expect } from '@playwright/test';

test.describe('AlloBrico Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocking for consistent test data
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Plomberie', description: 'Travaux de plomberie' },
          { id: '2', name: 'Électricité', description: 'Travaux électriques' },
          { id: '3', name: 'Peinture', description: 'Travaux de peinture' },
        ])
      });
    });

    await page.route('**/api/workers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'worker1',
              name: 'Pierre Martin',
              email: 'pierre@example.com',
              skills: ['Plomberie', 'Électricité'],
              rating: 4.8,
              location: 'Paris',
              avatar: 'PM'
            },
            {
              id: 'worker2',
              name: 'Marie Dubois',
              email: 'marie@example.com',
              skills: ['Peinture', 'Décoration'],
              rating: 4.9,
              location: 'Lyon',
              avatar: 'MD'
            }
          ]
        })
      });
    });
  });

  test('complete client journey: login -> browse -> request -> chat', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('/');

    // 2. Verify we're on the login page
    await expect(page).toHaveTitle(/AlloBrico/);
    await expect(page.getByText('Connexion')).toBeVisible();

    // 3. Use demo client login
    await page.getByRole('button', { name: /client/i }).click();

    // 4. Verify we're in the client dashboard
    await expect(page.getByText('Espace Client')).toBeVisible();
    await expect(page.getByText('Pierre Martin')).toBeVisible();

    // 5. Browse available workers
    await expect(page.getByText('Pierre Martin')).toBeVisible();
    await expect(page.getByText('Marie Dubois')).toBeVisible();

    // 6. Start a conversation with a worker
    const messageButton = page.locator('button').filter({ has: page.locator('[data-testid="MessageCircle"]') });
    await messageButton.click();

    // 7. Verify message popover opens
    await expect(page.getByText('Messages')).toBeVisible();

    // 8. Check that we can see the chat interface
    // (Note: In a real scenario, we'd have conversations to display)
    await expect(page.getByText('Messages')).toBeVisible();
  });

  test('complete worker journey: login -> dashboard -> respond to requests', async ({ page }) => {
    // Mock requests data
    await page.route('**/api/requests', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'req1',
            clientId: 'client1',
            clientName: 'Jean Dupont',
            category: 'Plomberie',
            description: 'Réparation de fuite d\'eau',
            location: 'Paris 15e',
            urgency: 'high',
            budget: 150,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // 1. Navigate to the application
    await page.goto('/');

    // 2. Use demo worker login
    await page.getByRole('button', { name: /artisan/i }).click();

    // 3. Verify we're in the worker dashboard
    await expect(page.getByText('Espace Artisan')).toBeVisible();

    // 4. Check for available requests
    await expect(page.getByText('Réparation de fuite d\'eau')).toBeVisible();
    await expect(page.getByText('Jean Dupont')).toBeVisible();
    await expect(page.getByText('Plomberie')).toBeVisible();

    // 5. Access messages
    const messageButton = page.locator('button').filter({ has: page.locator('[data-testid="MessageCircle"]') });
    await messageButton.click();

    // 6. Verify message interface
    await expect(page.getByText('Messages')).toBeVisible();
  });

  test('authentication flow: real login attempt', async ({ page }) => {
    // Mock login API
    await page.route('**/api/auth/login', async route => {
      const requestData = route.request().postDataJSON();

      if (requestData.email === 'test@example.com' && requestData.password === 'password123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'client'
            },
            token: 'mock-jwt-token'
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        });
      }
    });

    // 1. Navigate to login page
    await page.goto('/');

    // 2. Fill login form
    await page.getByLabel('Adresse email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('password123');

    // 3. Select user role
    await page.getByLabel('Type de compte').click();
    await page.getByText('Client particulier').click();

    // 4. Submit login
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // 5. Verify successful login and redirect to dashboard
    await expect(page.getByText('Espace Client')).toBeVisible();
  });

  test('message badge updates correctly', async ({ page }) => {
    // Mock conversations with unread messages
    await page.route('**/api/messages/conversations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'conv1',
            participants: [
              { id: 'user1', name: 'Client', type: 'client' },
              { id: 'worker1', name: 'Worker', type: 'worker' }
            ],
            lastMessage: {
              id: 'msg1',
              content: 'Hello, I can help!',
              timestamp: new Date().toISOString(),
              senderId: 'worker1',
              senderName: 'Worker',
              senderType: 'worker',
              read: false
            },
            unreadCount: 3,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'conv2',
            participants: [
              { id: 'user1', name: 'Client', type: 'client' },
              { id: 'worker2', name: 'Worker 2', type: 'worker' }
            ],
            lastMessage: {
              id: 'msg2',
              content: 'Available tomorrow',
              timestamp: new Date().toISOString(),
              senderId: 'worker2',
              senderName: 'Worker 2',
              senderType: 'worker',
              read: true
            },
            unreadCount: 0,
            updatedAt: new Date().toISOString()
          }
        ])
      });
    });

    // 1. Login as client
    await page.goto('/');
    await page.getByRole('button', { name: /client/i }).click();

    // 2. Verify message badge shows total unread count (3)
    await expect(page.getByText('3')).toBeVisible();

    // 3. Click on messages
    const messageButton = page.locator('button').filter({ has: page.locator('[data-testid="MessageCircle"]') });
    await messageButton.click();

    // 4. Verify message popover shows conversations
    await expect(page.getByText('Messages')).toBeVisible();
    await expect(page.getByText('Hello, I can help!')).toBeVisible();
  });

  test('responsive design: mobile view', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile viewports');

    // 1. Navigate to the application
    await page.goto('/');

    // 2. Verify mobile layout
    await expect(page.getByText('Connexion')).toBeVisible();

    // 3. Login with demo client
    await page.getByRole('button', { name: /client/i }).click();

    // 4. Verify mobile dashboard
    await expect(page.getByText('Espace Client')).toBeVisible();

    // 5. Check that navigation works on mobile
    const messageButton = page.locator('button').filter({ has: page.locator('[data-testid="MessageCircle"]') });
    await messageButton.click();

    // 6. Verify mobile message interface
    await expect(page.getByText('Messages')).toBeVisible();
  });

  test('error handling: network failure', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/categories', async route => {
      await route.abort();
    });

    // 1. Navigate to the application
    await page.goto('/');

    // 2. Login as client
    await page.getByRole('button', { name: /client/i }).click();

    // 3. Verify the app handles network errors gracefully
    // The app should still load even with network issues
    await expect(page.getByText('Espace Client')).toBeVisible();
  });

  test('accessibility: keyboard navigation', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/');

    // 2. Test keyboard navigation through login form
    await page.keyboard.press('Tab'); // Focus on email field
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab'); // Focus on password field
    await page.keyboard.type('password123');
    await page.keyboard.press('Tab'); // Focus on role selector
    await page.keyboard.press('Enter'); // Open role dropdown
    await page.keyboard.press('ArrowDown'); // Select first option
    await page.keyboard.press('Enter'); // Confirm selection
    await page.keyboard.press('Tab'); // Focus on login button
    await page.keyboard.press('Enter'); // Submit form

    // 3. Verify successful navigation and login
    await expect(page.getByText('Espace Client')).toBeVisible();
  });
});