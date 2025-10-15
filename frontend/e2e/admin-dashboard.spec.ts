import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          },
          token: 'admin-jwt-token'
        })
      });
    });

    // Mock admin data
    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 1250,
          totalWorkers: 340,
          totalClients: 910,
          totalRequests: 567,
          activeRequests: 89,
          completedRequests: 478,
          revenue: 45670.50,
          monthlyGrowth: 12.5
        })
      });
    });

    await page.route('**/api/admin/users', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'user1',
            name: 'Jean Dupont',
            email: 'jean@example.com',
            role: 'client',
            status: 'active',
            createdAt: '2024-01-15T10:30:00Z',
            lastLogin: '2024-01-20T14:22:00Z'
          },
          {
            id: 'worker1',
            name: 'Pierre Martin',
            email: 'pierre@example.com',
            role: 'worker',
            status: 'active',
            skills: ['Plomberie', 'Électricité'],
            rating: 4.8,
            createdAt: '2024-01-10T09:15:00Z',
            lastLogin: '2024-01-20T16:45:00Z'
          }
        ])
      });
    });

    await page.route('**/api/admin/requests', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'req1',
            clientName: 'Marie Dubois',
            workerName: 'Pierre Martin',
            category: 'Plomberie',
            status: 'in_progress',
            createdAt: '2024-01-19T11:00:00Z',
            budget: 150
          },
          {
            id: 'req2',
            clientName: 'Paul Leroy',
            workerName: null,
            category: 'Électricité',
            status: 'pending',
            createdAt: '2024-01-20T08:30:00Z',
            budget: 200
          }
        ])
      });
    });
  });

  test('admin login and dashboard overview', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/');

    // 2. Fill admin login form
    await page.getByLabel('Adresse email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('admin123');

    // 3. Select admin role
    await page.getByLabel('Type de compte').click();
    await page.getByText('Administrateur').click();

    // 4. Submit login
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // 5. Verify admin dashboard loads
    await expect(page.getByText('Tableau de Bord Administrateur')).toBeVisible();

    // 6. Check statistics display
    await expect(page.getByText('1,250')).toBeVisible(); // Total users
    await expect(page.getByText('340')).toBeVisible(); // Total workers
    await expect(page.getByText('910')).toBeVisible(); // Total clients
    await expect(page.getByText('567')).toBeVisible(); // Total requests
    await expect(page.getByText('45,670.50 €')).toBeVisible(); // Revenue
  });

  test('admin user management', async ({ page }) => {
    // 1. Login as admin (reuse login logic from previous test)
    await page.goto('/');
    await page.getByLabel('Adresse email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByLabel('Type de compte').click();
    await page.getByText('Administrateur').click();
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // 2. Navigate to user management
    await page.getByText('Gestion des Utilisateurs').click();

    // 3. Verify user list displays
    await expect(page.getByText('Jean Dupont')).toBeVisible();
    await expect(page.getByText('Pierre Martin')).toBeVisible();
    await expect(page.getByText('client')).toBeVisible();
    await expect(page.getByText('worker')).toBeVisible();

    // 4. Test user search/filter
    await page.getByPlaceholder('Rechercher un utilisateur...').fill('Pierre');
    await expect(page.getByText('Jean Dupont')).not.toBeVisible();
    await expect(page.getByText('Pierre Martin')).toBeVisible();

    // 5. Test user status toggle
    const statusButton = page.locator('button').filter({ hasText: 'Actif' }).first();
    await statusButton.click();
    // Verify status change (would need more specific selectors in real app)
  });

  test('admin request monitoring', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/');
    await page.getByLabel('Adresse email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByLabel('Type de compte').click();
    await page.getByText('Administrateur').click();
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // 2. Navigate to requests section
    await page.getByText('Demandes').click();

    // 3. Verify requests display
    await expect(page.getByText('Marie Dubois')).toBeVisible();
    await expect(page.getByText('Pierre Martin')).toBeVisible();
    await expect(page.getByText('Paul Leroy')).toBeVisible();
    await expect(page.getByText('En cours')).toBeVisible();
    await expect(page.getByText('En attente')).toBeVisible();

    // 4. Test request filtering
    await page.getByText('En attente').click();
    await expect(page.getByText('Marie Dubois')).not.toBeVisible();
    await expect(page.getByText('Paul Leroy')).toBeVisible();
  });

  test('admin category management', async ({ page }) => {
    // Mock categories data
    await page.route('**/api/admin/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Plomberie', description: 'Travaux de plomberie', active: true },
          { id: '2', name: 'Électricité', description: 'Travaux électriques', active: true },
          { id: '3', name: 'Peinture', description: 'Travaux de peinture', active: false }
        ])
      });
    });

    // 1. Login as admin
    await page.goto('/');
    await page.getByLabel('Adresse email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByLabel('Type de compte').click();
    await page.getByText('Administrateur').click();
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // 2. Navigate to categories
    await page.getByText('Catégories').click();

    // 3. Verify categories display
    await expect(page.getByText('Plomberie')).toBeVisible();
    await expect(page.getByText('Électricité')).toBeVisible();
    await expect(page.getByText('Peinture')).toBeVisible();

    // 4. Test adding new category
    await page.getByRole('button', { name: 'Ajouter une catégorie' }).click();
    await page.getByLabel('Nom').fill('Jardinage');
    await page.getByLabel('Description').fill('Travaux de jardinage et espaces verts');
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // 5. Verify new category appears
    await expect(page.getByText('Jardinage')).toBeVisible();
  });
});