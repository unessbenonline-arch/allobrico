import { query } from '../database';

const categories = [
  { id: 'cat-1', name: 'Plomberie', slug: 'plomberie', description: 'Installation et réparation de systèmes de plomberie', icon: '🔧', sort_order: 1 },
  { id: 'cat-2', name: 'Électricité', slug: 'electricite', description: 'Travaux électriques et installations', icon: '⚡', sort_order: 2 },
  { id: 'cat-3', name: 'Peinture', slug: 'peinture', description: 'Peinture intérieure et extérieure', icon: '🎨', sort_order: 3 },
  { id: 'cat-4', name: 'Jardinage', slug: 'jardinage', description: 'Aménagement et entretien des espaces verts', icon: '🌱', sort_order: 4 },
  { id: 'cat-5', name: 'Menuiserie', slug: 'menuiserie', description: 'Travaux de bois et menuiserie', icon: '🔨', sort_order: 5 },
  { id: 'cat-6', name: 'Climatisation', slug: 'climatisation', description: 'Installation et réparation de systèmes de climatisation', icon: '❄️', sort_order: 6 },
  { id: 'cat-7', name: 'Maçonnerie', slug: 'maconnerie', description: 'Travaux de maçonnerie et construction', icon: '🧱', sort_order: 7 },
  { id: 'cat-8', name: 'Carrelage', slug: 'carrelage', description: 'Pose et rénovation de carrelage', icon: '🔲', sort_order: 8 },
  { id: 'cat-9', name: 'Électroménager', slug: 'electromenager', description: 'Réparation d\'appareils électroménagers', icon: '🔌', sort_order: 9 },
  { id: 'cat-10', name: 'Nettoyage', slug: 'nettoyage', description: 'Services de nettoyage professionnel', icon: '🧹', sort_order: 10 },
  { id: 'cat-11', name: 'Déménagement', slug: 'demenagement', description: 'Services de déménagement et transport', icon: '📦', sort_order: 11 },
  { id: 'cat-12', name: 'Informatique', slug: 'informatique', description: 'Services informatiques et dépannage', icon: '💻', sort_order: 12 },
  { id: 'cat-13', name: 'Serrurerie', slug: 'serrurerie', description: 'Services de serrurerie et sécurité', icon: '🔐', sort_order: 13 },
  { id: 'cat-14', name: 'Vitrerie', slug: 'vitrerie', description: 'Réparation et remplacement de vitres', icon: '🪟', sort_order: 14 },
  { id: 'cat-15', name: 'Cuisine', slug: 'cuisine', description: 'Installation et rénovation de cuisines', icon: '👨‍🍳', sort_order: 15 },
  { id: 'cat-16', name: 'Salle de bain', slug: 'salle-de-bain', description: 'Rénovation et installation de salles de bain', icon: '🛁', sort_order: 16 },
  { id: 'cat-17', name: 'Chauffage', slug: 'chauffage', description: 'Installation et réparation de systèmes de chauffage', icon: '🔥', sort_order: 17 },
  { id: 'cat-18', name: 'Isolation', slug: 'isolation', description: 'Travaux d\'isolation thermique et acoustique', icon: '🏠', sort_order: 18 },
  { id: 'cat-19', name: 'Éclairage', slug: 'eclairage', description: 'Installation et réparation d\'éclairage', icon: '💡', sort_order: 19 },
  { id: 'cat-20', name: 'Antennes', slug: 'antennes', description: 'Installation et réparation d\'antennes', icon: '📡', sort_order: 20 }
];

async function insertCategories() {
  try {
    // Clear existing categories
    await query('DELETE FROM categories');

    // Insert new categories
    for (const category of categories) {
      await query(
        'INSERT INTO categories (id, name, slug, description, icon, is_active, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [category.id, category.name, category.slug, category.description, category.icon, true, category.sort_order]
      );
    }

    console.log('✅ Successfully inserted', categories.length, 'categories into database');
  } catch (error) {
    console.error('❌ Error inserting categories:', error);
  } finally {
    process.exit(0);
  }
}

insertCategories();