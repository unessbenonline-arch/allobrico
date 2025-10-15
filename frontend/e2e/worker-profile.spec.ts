import { test, expect } from '@playwright/test';

test.describe('Worker Registration and Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock registration API
    await page.route('**/api/auth/register', async route => {
      const requestData = route.request().postDataJSON();

      if (requestData.role === 'worker') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'worker_new',
              name: requestData.name,
              email: requestData.email,
              role: 'worker',
              skills: requestData.skills || [],
              location: requestData.location,
              phone: requestData.phone,
              description: requestData.description
            },
            token: 'worker-jwt-token'
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid role' })
        });
      }
    });

    // Mock profile update API
    await page.route('**/api/workers/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'worker1',
          name: 'Pierre Martin',
          email: 'pierre@example.com',
          skills: ['Plomberie', 'Électricité', 'Chauffage'],
          location: 'Paris',
          phone: '+33123456789',
          description: 'Artisan expérimenté en plomberie et électricité',
          rating: 4.8,
          completedJobs: 45,
          hourlyRate: 50,
          availability: 'weekdays',
          certifications: ['Qualification Électricité', 'Assurance Décennale']
        })
      });
    });

    // Mock categories for skills selection
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Plomberie', description: 'Travaux de plomberie' },
          { id: '2', name: 'Électricité', description: 'Travaux électriques' },
          { id: '3', name: 'Peinture', description: 'Travaux de peinture' },
          { id: '4', name: 'Chauffage', description: 'Installation et réparation chauffage' },
          { id: '5', name: 'Menuiserie', description: 'Travaux de menuiserie' }
        ])
      });
    });
  });

  test('worker registration flow', async ({ page }) => {
    // 1. Navigate to registration page
    await page.goto('/register');

    // 2. Select worker registration
    await page.getByRole('button', { name: /artisan/i }).click();

    // 3. Fill registration form
    await page.getByLabel('Nom complet').fill('Pierre Martin');
    await page.getByLabel('Adresse email').fill('pierre@example.com');
    await page.getByLabel('Téléphone').fill('+33123456789');
    await page.getByLabel('Localisation').fill('Paris');
    await page.getByLabel('Mot de passe').fill('securepassword123');
    await page.getByLabel('Confirmer le mot de passe').fill('securepassword123');

    // 4. Select skills
    await page.getByText('Plomberie').click();
    await page.getByText('Électricité').click();

    // 5. Add description
    await page.getByLabel('Description de vos services').fill('Artisan expérimenté en plomberie et électricité avec 10 ans d\'expérience');

    // 6. Set hourly rate
    await page.getByLabel('Tarif horaire (€)').fill('50');

    // 7. Submit registration
    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    // 8. Verify successful registration and redirect to worker dashboard
    await expect(page.getByText('Espace Artisan')).toBeVisible();
    await expect(page.getByText('Bienvenue, Pierre Martin')).toBeVisible();
  });

  test('worker profile completion', async ({ page }) => {
    // 1. Login as worker
    await page.goto('/');
    await page.getByRole('button', { name: /artisan/i }).click();

    // 2. Navigate to profile section
    await page.getByText('Mon Profil').click();

    // 3. Verify profile information displays
    await expect(page.getByText('Pierre Martin')).toBeVisible();
    await expect(page.getByText('pierre@example.com')).toBeVisible();
    await expect(page.getByText('Paris')).toBeVisible();

    // 4. Edit profile information
    await page.getByRole('button', { name: 'Modifier' }).click();

    // 5. Update skills
    await page.getByText('Chauffage').click(); // Add new skill

    // 6. Update description
    await page.getByLabel('Description').fill('Artisan expérimenté en plomberie, électricité et chauffage avec 10 ans d\'expérience');

    // 7. Update hourly rate
    await page.getByLabel('Tarif horaire').clear();
    await page.getByLabel('Tarif horaire').fill('55');

    // 8. Update availability
    await page.getByLabel('Disponibilité').selectOption('weekends');

    // 9. Save changes
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // 10. Verify changes are saved
    await expect(page.getByText('Chauffage')).toBeVisible();
    await expect(page.getByText('55 €/h')).toBeVisible();
  });

  test('worker certification upload', async ({ page }) => {
    // Mock file upload API
    await page.route('**/api/workers/certifications', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          certifications: [
            {
              id: 'cert1',
              name: 'Qualification Électricité',
              issuer: 'Qualifelec',
              issueDate: '2023-06-15',
              expiryDate: '2026-06-15',
              verified: true
            }
          ]
        })
      });
    });

    // 1. Login as worker
    await page.goto('/');
    await page.getByRole('button', { name: /artisan/i }).click();

    // 2. Navigate to certifications section
    await page.getByText('Certifications').click();

    // 3. Upload certification
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'qualification-electricite.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });

    // 4. Fill certification details
    await page.getByLabel('Nom de la certification').fill('Qualification Électricité');
    await page.getByLabel('Organisme').fill('Qualifelec');
    await page.getByLabel('Date d\'obtention').fill('2023-06-15');
    await page.getByLabel('Date d\'expiration').fill('2026-06-15');

    // 5. Submit certification
    await page.getByRole('button', { name: 'Ajouter la certification' }).click();

    // 6. Verify certification appears in list
    await expect(page.getByText('Qualification Électricité')).toBeVisible();
    await expect(page.getByText('Qualifelec')).toBeVisible();
    await expect(page.getByText('Vérifiée')).toBeVisible();
  });

  test('worker portfolio management', async ({ page }) => {
    // Mock portfolio API
    await page.route('**/api/workers/portfolio', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'work1',
            title: 'Rénovation salle de bain',
            description: 'Rénovation complète d\'une salle de bain avec installation de douche à l\'italienne',
            category: 'Plomberie',
            images: ['bathroom1.jpg', 'bathroom2.jpg'],
            completionDate: '2024-01-10',
            clientRating: 5
          },
          {
            id: 'work2',
            title: 'Installation électrique cuisine',
            description: 'Installation complète du réseau électrique d\'une cuisine moderne',
            category: 'Électricité',
            images: ['kitchen1.jpg'],
            completionDate: '2024-01-05',
            clientRating: 4.5
          }
        ])
      });
    });

    // 1. Login as worker
    await page.goto('/');
    await page.getByRole('button', { name: /artisan/i }).click();

    // 2. Navigate to portfolio section
    await page.getByText('Portfolio').click();

    // 3. Verify existing works display
    await expect(page.getByText('Rénovation salle de bain')).toBeVisible();
    await expect(page.getByText('Installation électrique cuisine')).toBeVisible();

    // 4. Add new work to portfolio
    await page.getByRole('button', { name: 'Ajouter un projet' }).click();

    // 5. Fill work details
    await page.getByLabel('Titre du projet').fill('Réparation fuite d\'eau');
    await page.getByLabel('Description').fill('Réparation d\'une fuite importante sous évier avec remplacement des tuyaux');
    await page.getByLabel('Catégorie').selectOption('Plomberie');
    await page.getByLabel('Date de réalisation').fill('2024-01-18');

    // 6. Upload images (mock)
    const imageInput = page.locator('input[type="file"]').nth(1);
    await imageInput.setInputFiles([
      {
        name: 'repair1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('mock image content')
      }
    ]);

    // 7. Save new work
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // 8. Verify new work appears
    await expect(page.getByText('Réparation fuite d\'eau')).toBeVisible();
  });

  test('worker availability management', async ({ page }) => {
    // Mock availability API
    await page.route('**/api/workers/availability', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schedule: {
            monday: { available: true, startTime: '08:00', endTime: '18:00' },
            tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
            wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
            thursday: { available: true, startTime: '08:00', endTime: '18:00' },
            friday: { available: true, startTime: '08:00', endTime: '18:00' },
            saturday: { available: false, startTime: null, endTime: null },
            sunday: { available: false, startTime: null, endTime: null }
          },
          exceptions: [
            { date: '2024-01-25', available: false, reason: 'Vacances' }
          ]
        })
      });
    });

    // 1. Login as worker
    await page.goto('/');
    await page.getByRole('button', { name: /artisan/i }).click();

    // 2. Navigate to availability section
    await page.getByText('Disponibilités').click();

    // 3. Verify current schedule
    await expect(page.getByText('Lundi: 08:00 - 18:00')).toBeVisible();
    await expect(page.getByText('Samedi: Indisponible')).toBeVisible();

    // 4. Update availability
    await page.getByRole('button', { name: 'Modifier les disponibilités' }).click();

    // 5. Change Saturday availability
    await page.getByLabel('Samedi disponible').check();
    await page.getByLabel('Samedi début').fill('09:00');
    await page.getByLabel('Samedi fin').fill('17:00');

    // 6. Add exception
    await page.getByRole('button', { name: 'Ajouter une exception' }).click();
    await page.getByLabel('Date').fill('2024-02-01');
    await page.getByLabel('Motif').fill('Rendez-vous médical');

    // 7. Save changes
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // 8. Verify changes
    await expect(page.getByText('Samedi: 09:00 - 17:00')).toBeVisible();
    await expect(page.getByText('01/02/2024: Rendez-vous médical')).toBeVisible();
  });
});