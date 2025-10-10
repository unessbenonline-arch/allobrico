import express from 'express';
import { Category } from '../types';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the category
 *         name:
 *           type: string
 *           description: Category name in French
 *         description:
 *           type: string
 *           description: Detailed description of the category
 *         icon:
 *           type: string
 *           description: Emoji icon representing the category
 *         subcategories:
 *           type: array
 *           items:
 *             type: string
 *           description: List of subcategories
 *         popular:
 *           type: boolean
 *           description: Whether this is a popular category
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all service categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: popular
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter for popular categories only
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Maximum number of categories to return
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 total:
 *                   type: integer
 */

// Mock data for categories
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Plomberie',
    description: 'Installation et réparation de systèmes de plomberie',
    icon: '🔧',
    subcategories: ['Installation WC', 'Réparation fuite', 'Chauffage', 'Robinets', 'Tuyauterie'],
    popular: true
  },
  {
    id: 'cat-2',
    name: 'Électricité',
    description: 'Travaux électriques et installations',
    icon: '⚡',
    subcategories: ['Installation prises', 'Réparation panne', 'Domotique', 'Panneaux solaires', 'Éclairage'],
    popular: true
  },
  {
    id: 'cat-3',
    name: 'Peinture',
    description: 'Peinture intérieure et extérieure',
    icon: '🎨',
    subcategories: ['Peinture murs', 'Peinture plafond', 'Décoration', 'Enduit', 'Vernis'],
    popular: true
  },
  {
    id: 'cat-4',
    name: 'Jardinage',
    description: 'Aménagement et entretien des espaces verts',
    icon: '🌱',
    subcategories: ['Tonte gazon', 'Taille haies', 'Plantation', 'Arrosage automatique', 'Paysagisme'],
    popular: true
  },
  {
    id: 'cat-5',
    name: 'Menuiserie',
    description: 'Travaux de bois et menuiserie',
    icon: '🔨',
    subcategories: ['Portes', 'Fenêtres', 'Escaliers', 'Meubles sur mesure', 'Réparation bois'],
    popular: true
  },
  {
    id: 'cat-6',
    name: 'Climatisation',
    description: 'Installation et réparation de systèmes de climatisation',
    icon: '❄️',
    subcategories: ['Installation climatiseur', 'Réparation', 'Maintenance', 'Dépannage urgence', 'Nettoyage'],
    popular: false
  },
  {
    id: 'cat-7',
    name: 'Maçonnerie',
    description: 'Travaux de maçonnerie et construction',
    icon: '🧱',
    subcategories: ['Mur porteur', 'Extension', 'Rénovation', 'Isolation', 'Démolition'],
    popular: false
  },
  {
    id: 'cat-8',
    name: 'Carrelage',
    description: 'Pose et rénovation de carrelage',
    icon: '🔲',
    subcategories: ['Salle de bain', 'Cuisine', 'Sol', 'Mur', 'Réparation'],
    popular: false
  },
  {
    id: 'cat-9',
    name: 'Électroménager',
    description: 'Réparation d\'appareils électroménagers',
    icon: '🔌',
    subcategories: ['Réfrigérateur', 'Lave-linge', 'Lave-vaisselle', 'Four', 'Micro-ondes'],
    popular: false
  },
  {
    id: 'cat-10',
    name: 'Nettoyage',
    description: 'Services de nettoyage professionnel',
    icon: '🧹',
    subcategories: ['Ménage', 'Vitres', 'Moquettes', 'Après travaux', 'Désinfection'],
    popular: false
  },
  {
    id: 'cat-11',
    name: 'Déménagement',
    description: 'Services de déménagement et transport',
    icon: '📦',
    subcategories: ['Déménagement complet', 'Transport meubles', 'Garde-meubles', 'Emballage', 'Monte-meubles'],
    popular: false
  },
  {
    id: 'cat-12',
    name: 'Informatique',
    description: 'Services informatiques et dépannage',
    icon: '💻',
    subcategories: ['Réparation PC', 'Installation logiciels', 'Réseau', 'Sécurité', 'Formation'],
    popular: false
  },
  {
    id: 'cat-13',
    name: 'Serrurerie',
    description: 'Services de serrurerie et sécurité',
    icon: '🔐',
    subcategories: ['Ouverture porte', 'Changement serrure', 'Installation alarme', 'Coffre-fort', 'Blindage'],
    popular: false
  },
  {
    id: 'cat-14',
    name: 'Vitrerie',
    description: 'Réparation et remplacement de vitres',
    icon: '🪟',
    subcategories: ['Remplacement vitre', 'Réparation', 'Double vitrage', 'Miroiterie', 'Vitrage sécurité'],
    popular: false
  },
  {
    id: 'cat-15',
    name: 'Cuisine',
    description: 'Installation et rénovation de cuisines',
    icon: '👨‍🍳',
    subcategories: ['Cuisine complète', 'Électroménager', 'Plan de travail', 'Évier', 'Rénovation'],
    popular: false
  },
  {
    id: 'cat-16',
    name: 'Salle de bain',
    description: 'Rénovation et installation de salles de bain',
    icon: '🛁',
    subcategories: ['Salle de bain complète', 'Douche', 'Baignoire', 'WC', 'Carrelage'],
    popular: false
  },
  {
    id: 'cat-17',
    name: 'Chauffage',
    description: 'Installation et réparation de systèmes de chauffage',
    icon: '🔥',
    subcategories: ['Chaudière', 'Radiateurs', 'Plancher chauffant', 'Pompe à chaleur', 'Maintenance'],
    popular: false
  },
  {
    id: 'cat-18',
    name: 'Isolation',
    description: 'Travaux d\'isolation thermique et acoustique',
    icon: '🏠',
    subcategories: ['Combles', 'Murs', 'Sol', 'Fenêtres', 'Acoustique'],
    popular: false
  },
  {
    id: 'cat-19',
    name: 'Éclairage',
    description: 'Installation et réparation d\'éclairage',
    icon: '💡',
    subcategories: ['Intérieur', 'Extérieur', 'LED', 'Domotique', 'Dépannage'],
    popular: false
  },
  {
    id: 'cat-20',
    name: 'Antennes',
    description: 'Installation et réparation d\'antennes',
    icon: '📡',
    subcategories: ['TV', 'Internet', 'Téléphone', 'Paratonnerre', 'Amplificateur'],
    popular: false
  }
];

// GET /api/categories - Get all categories
router.get('/', (req, res) => {
  const { popular, limit = '20' } = req.query;
  let categories = mockCategories;

  if (popular === 'true') {
    categories = categories.filter(cat => cat.popular);
  }

  const limitedCategories = categories.slice(0, parseInt(limit as string));

  res.json({
    data: limitedCategories,
    total: mockCategories.length
  });
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const category = mockCategories.find(cat => cat.id === id);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  return res.json({ data: category });
});

// GET /api/categories/popular - Get popular categories
router.get('/popular', (req, res) => {
  const popularCategories = mockCategories.filter(cat => cat.popular);
  res.json({ data: popularCategories });
});

// GET /api/categories/search - Search categories
router.get('/search', (req, res) => {
  const { q: query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const searchResults = mockCategories.filter(cat =>
    cat.name.toLowerCase().includes(query.toLowerCase()) ||
    cat.description.toLowerCase().includes(query.toLowerCase()) ||
    cat.subcategories?.some(sub => sub.toLowerCase().includes(query.toLowerCase()))
  );

  return res.json({ data: searchResults });
});

export default router;