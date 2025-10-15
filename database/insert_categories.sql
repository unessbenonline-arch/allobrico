-- Insert categories with proper icons and data
-- Clear existing categories first
DELETE FROM categories;

-- Insert all categories from mock data
INSERT INTO categories (id, name, slug, description, icon, is_active, sort_order) VALUES
('cat-1', 'Plomberie', 'plomberie', 'Installation et réparation de systèmes de plomberie', '🔧', true, 1),
('cat-2', 'Électricité', 'electricite', 'Travaux électriques et installations', '⚡', true, 2),
('cat-3', 'Peinture', 'peinture', 'Peinture intérieure et extérieure', '🎨', true, 3),
('cat-4', 'Jardinage', 'jardinage', 'Aménagement et entretien des espaces verts', '🌱', true, 4),
('cat-5', 'Menuiserie', 'menuiserie', 'Travaux de bois et menuiserie', '🔨', true, 5),
('cat-6', 'Climatisation', 'climatisation', 'Installation et réparation de systèmes de climatisation', '❄️', true, 6),
('cat-7', 'Maçonnerie', 'maconnerie', 'Travaux de maçonnerie et construction', '🧱', true, 7),
('cat-8', 'Carrelage', 'carrelage', 'Pose et rénovation de carrelage', '🔲', true, 8),
('cat-9', 'Électroménager', 'electromenager', 'Réparation d''appareils électroménagers', '🔌', true, 9),
('cat-10', 'Nettoyage', 'nettoyage', 'Services de nettoyage professionnel', '🧹', true, 10),
('cat-11', 'Déménagement', 'demenagement', 'Services de déménagement et transport', '📦', true, 11),
('cat-12', 'Informatique', 'informatique', 'Services informatiques et dépannage', '💻', true, 12),
('cat-13', 'Serrurerie', 'serrurerie', 'Services de serrurerie et sécurité', '🔐', true, 13),
('cat-14', 'Vitrerie', 'vitrerie', 'Réparation et remplacement de vitres', '🪟', true, 14),
('cat-15', 'Cuisine', 'cuisine', 'Installation et rénovation de cuisines', '👨‍🍳', true, 15),
('cat-16', 'Salle de bain', 'salle-de-bain', 'Rénovation et installation de salles de bain', '🛁', true, 16),
('cat-17', 'Chauffage', 'chauffage', 'Installation et réparation de systèmes de chauffage', '🔥', true, 17),
('cat-18', 'Isolation', 'isolation', 'Travaux d''isolation thermique et acoustique', '🏠', true, 18),
('cat-19', 'Éclairage', 'eclairage', 'Installation et réparation d''éclairage', '💡', true, 19),
('cat-20', 'Antennes', 'antennes', 'Installation et réparation d''antennes', '📡', true, 20);