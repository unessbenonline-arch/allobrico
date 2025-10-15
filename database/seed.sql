-- Allobbrico Database Seed Data
-- This script populates the database with comprehensive test data
-- Run this after the schema initialization

-- Create missing tables first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table (for chat)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1 UUID NOT NULL REFERENCES users(id),
    participant_2 UUID NOT NULL REFERENCES users(id),
    related_request_id UUID REFERENCES requests(id),
    title VARCHAR(255),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachments TEXT[],
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics/Stats table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_request_id ON conversations(related_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert additional users for comprehensive testing
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, status, email_verified, phone_verified, address, preferences, specialty, rating, jobs_completed, worker_status, location, worker_type, accepts_urgent, hourly_rate, description, skills, certifications) VALUES
-- Additional clients
('marie.dupont@email.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Marie', 'Dupont', '+33611223344', 'client', 'active', true, true, '15 Rue de la Paix, Paris 75001', ARRAY['plomberie', 'electricite'], null, null, null, null, null, null, null, null, null, null, null),
('pierre.durand@email.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Pierre', 'Durand', '+33622334455', 'client', 'active', true, true, '25 Avenue des Champs-Élysées, Paris 75008', ARRAY['peinture', 'menuiserie'], null, null, null, null, null, null, null, null, null, null, null),
('sophie.laurent@email.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Sophie', 'Laurent', '+33633445566', 'client', 'active', true, true, '10 Boulevard Saint-Michel, Paris 75005', ARRAY['jardinage', 'renovation'], null, null, null, null, null, null, null, null, null, null, null),
('thomas.robert@email.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Thomas', 'Robert', '+33644556677', 'client', 'active', true, true, '5 Place de la Bastille, Paris 75011', ARRAY['climatisation', 'chauffage'], null, null, null, null, null, null, null, null, null, null, null),
('emma.martin@email.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Emma', 'Martin', '+33655667788', 'client', 'active', true, true, '30 Rue Oberkampf, Paris 75011', ARRAY['plomberie', 'peinture'], null, null, null, null, null, null, null, null, null, null, null),

-- Additional workers
('jean.martin@artisan.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Jean', 'Martin', '+33666778899', 'worker', 'active', true, true, null, null, 'Plomberie', 4.8, 127, 'available', 'Paris et région parisienne', 'artisan', true, 65.00, 'Plombier expérimenté avec 15 ans d''expérience. Spécialisé dans les urgences et réparations.', ARRAY['réparation fuite', 'installation sanitaire', 'débouchage', 'chauffe-eau'], ARRAY['Qualification plomberie', 'Assurance décennale']),
('pierre.dubois@artisan.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Pierre', 'Dubois', '+33677889900', 'worker', 'active', true, true, null, null, 'Électricité', 4.6, 89, 'available', 'Île-de-France', 'artisan', false, 70.00, 'Électricien qualifié pour tous travaux électriques résidentiels et tertiaires.', ARRAY['installation électrique', 'dépannage', 'mise aux normes', 'domotique'], ARRAY['Qualification électricien', 'Assurance décennale']),
('marc.lefebvre@artisan.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Marc', 'Lefebvre', '+33688990011', 'worker', 'active', true, true, null, null, 'Peinture', 4.7, 156, 'busy', 'Paris', 'artisan', true, 45.00, 'Peintre en bâtiment intérieur/extérieur. Travail soigné et matériaux de qualité.', ARRAY['peinture intérieure', 'peinture extérieure', 'enduits', 'décoration'], ARRAY['CAP peinture', 'Assurance décennale']),
('lucas.garcia@artisan.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Lucas', 'Garcia', '+33699001122', 'worker', 'active', true, true, null, null, 'Menuiserie', 4.9, 203, 'available', 'Paris et banlieue', 'artisan', false, 55.00, 'Menuisier ébéniste pour tous travaux de bois et agencement.', ARRAY['menuiserie', 'ébénisterie', 'agencement', 'rénovation bois'], ARRAY['BTS menuiserie', 'Assurance décennale']),
('antoine.bernard@artisan.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Antoine', 'Bernard', '+33700112233', 'worker', 'active', true, true, null, null, 'Jardinage', 4.5, 78, 'available', 'Région parisienne', 'artisan', true, 40.00, 'Paysagiste et jardinier pour création et entretien d''espaces verts.', ARRAY['aménagement jardin', 'entretien', 'pelouse', 'arrosage automatique'], ARRAY['BTS paysage', 'Assurance décennale']),

-- Company workers
('martin.electricite@sarl.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Martin', 'Électricité SARL', '+33145678912', 'worker', 'active', true, true, null, null, 'Électricité', 4.4, 312, 'available', 'Paris et Île-de-France', 'company', true, 85.00, 'Entreprise d''électricité générale. Interventions 7j/7, devis gratuit.', ARRAY['électricité générale', 'mise aux normes', 'installation', 'dépannage'], ARRAY['Qualification entreprise', 'Assurance décennale']),
('dupont.peinture@sas.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Dupont', 'Peinture SAS', '+33156789023', 'worker', 'active', true, true, null, null, 'Peinture', 4.6, 445, 'available', 'Paris', 'company', false, 60.00, 'Entreprise de peinture professionnelle. Équipe qualifiée et assurée.', ARRAY['peinture bâtiment', 'rénovation', 'décoration', 'isolation'], ARRAY['Qualification entreprise', 'Assurance décennale'])
ON CONFLICT (email) DO NOTHING;

-- Insert comprehensive requests data
INSERT INTO requests (title, description, category_id, client_id, assigned_worker_id, status, priority, budget_min, budget_max, final_budget, location, location_details, preferred_schedule, attachments, requirements, assigned_at, started_at, completed_at, deadline, client_rating, client_review, worker_rating, worker_review, admin_notes) VALUES
-- Open requests
('Fuite d''eau sous évier cuisine', 'Fuite importante sous l''évier de la cuisine, besoin intervention urgente avant dégâts importants', (SELECT id FROM categories WHERE slug = 'plomberie' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), null, 'open', 'urgent', 80, 150, null, 'Paris 15ème', 'Appartement 3ème étage, code 1234A', 'Aujourd''hui si possible', null, 'Accès facile au sous-sol, eau coupée si nécessaire', null, null, null, CURRENT_TIMESTAMP + INTERVAL '2 days', null, null, null, null, null),
('Installation nouvelle prise électrique', 'Besoin d''une prise supplémentaire dans le salon pour la TV et console de jeux', (SELECT id FROM categories WHERE slug = 'electricite' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), null, 'open', 'normal', 60, 120, null, 'Boulogne-Billancourt', 'Maison individuelle, accès par jardin', 'Cette semaine', null, 'Matériel fourni par le client si possible', null, null, null, CURRENT_TIMESTAMP + INTERVAL '7 days', null, null, null, null, null),
('Peinture chambre enfant', 'Repeindre la chambre de mon fils de 8 ans en thème super-héros (bleu et rouge)', (SELECT id FROM categories WHERE slug = 'peinture' LIMIT 1), (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), null, 'open', 'normal', 200, 400, null, 'Paris 10ème', 'Chambre 12m², murs en bon état', 'Dans 2 semaines', null, 'Peinture écologique souhaitée, préparation mur incluse', null, null, null, CURRENT_TIMESTAMP + INTERVAL '14 days', null, null, null, null, null),
('Réparation porte d''entrée', 'Porte d''entrée qui coince et ne ferme plus correctement, gond défaillant', (SELECT id FROM categories WHERE slug = 'menuiserie' LIMIT 1), (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), null, 'open', 'high', 100, 200, null, 'Paris 11ème', 'Immeuble ancien, porte bois massif', 'Dès que possible', null, 'Conservation du style ancien si possible', null, null, null, CURRENT_TIMESTAMP + INTERVAL '5 days', null, null, null, null, null),
('Taille haie et entretien jardin', 'Taille de la haie, tonte pelouse, et nettoyage massif', (SELECT id FROM categories WHERE slug = 'jardinage' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), null, 'open', 'normal', 80, 150, null, 'Neuilly-sur-Seine', 'Jardin 200m², haie 50m linéaire', 'Week-end prochain', null, 'Évacuation des déchets comprise', null, null, null, CURRENT_TIMESTAMP + INTERVAL '10 days', null, null, null, null, null),

-- Assigned requests
('Réparation robinetterie salle de bain', 'Robinet qui fuit constamment, joint usé à remplacer', (SELECT id FROM categories WHERE slug = 'plomberie' LIMIT 1), (SELECT id FROM users WHERE email = 'client1@example.com' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'assigned', 'normal', 50, 100, 75, 'Paris 12ème', 'Salle de bain 2ème étage', 'Demain après-midi', null, 'Pièces fournies par l''artisan', CURRENT_TIMESTAMP - INTERVAL '1 day', null, null, CURRENT_TIMESTAMP + INTERVAL '1 day', 5, 'Très professionnel et rapide', null, null, null),
('Installation climatisation chambre', 'Installation d''un climatiseur mobile dans la chambre parentale', (SELECT id FROM categories WHERE slug = 'climatisation' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'worker2@example.com' LIMIT 1), 'assigned', 'normal', 150, 300, 220, 'Paris 7ème', 'Chambre 15m², fenêtre orientée nord', 'Cette semaine', null, 'Appareil fourni par le client', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day', null, CURRENT_TIMESTAMP + INTERVAL '3 days', null, null, null, null, null),

-- In progress requests
('Rénovation salle de bain complète', 'Rénovation complète : carrelage, peinture, installation douche à l''italienne', (SELECT id FROM categories WHERE slug = 'renovation' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), 'in_progress', 'high', 2000, 3500, 2800, 'Paris 16ème', 'Salle de bain 8m², accès par couloir', 'Travaux échelonnés sur 2 semaines', ARRAY['plan_salle_bain.jpg', 'inspiration.jpg'], 'Matériaux fournis par l''entreprise, coordination avec plombier', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days', null, CURRENT_TIMESTAMP + INTERVAL '10 days', null, null, null, null, null),
('Réparation chauffage central', 'Chaudière qui fonctionne mal, pertes de pression et bruit anormal', (SELECT id FROM categories WHERE slug = 'chauffage' LIMIT 1), (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'worker1@example.com' LIMIT 1), 'in_progress', 'urgent', 200, 500, null, 'Paris 13ème', 'Sous-sol, chaudière Viessmann 10 ans', 'Intervention urgente nécessaire', null, 'Pièces sous garantie si possible', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP, null, CURRENT_TIMESTAMP + INTERVAL '2 days', null, null, null, null, null),

-- Completed requests
('Peinture salon et couloir', 'Peinture complète du salon et couloir d''entrée, couleur blanc cassé', (SELECT id FROM categories WHERE slug = 'peinture' LIMIT 1), (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'completed', 'normal', 300, 500, 420, 'Paris 5ème', 'Appartement haussmannien, moulures à préserver', 'Travaux terminés', null, 'Préparation murs comprise', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 5, 'Excellent travail, très soigneux avec les moulures anciennes', 5, 'Client très satisfait, recommande', null),
('Installation étagères cuisine', 'Création et installation d''étagères sur mesure dans la cuisine américaine', (SELECT id FROM categories WHERE slug = 'menuiserie' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), 'completed', 'normal', 400, 700, 580, 'Paris 2ème', 'Cuisine américaine 12m², style industriel souhaité', 'Travaux terminés dans les délais', ARRAY['plan_etageres.pdf'], 'Bois fourni par l''artisan, finition huilé', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '18 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '15 days', 4, 'Très belle réalisation, finition parfaite', 4, 'Bonne communication, délais respectés', null),
('Aménagement terrasse', 'Création d''un espace détente avec plantation et mobilier de jardin', (SELECT id FROM categories WHERE slug = 'jardinage' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), 'completed', 'normal', 800, 1500, 1200, 'Paris 20ème', 'Terrasse 25m², exposition sud', 'Travaux terminés', ARRAY['plan_terrasse.jpg'], 'Plantes et mobilier fournis par le client', CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '22 days', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '20 days', 5, 'Terrasse magnifique, plantes en pleine forme', 5, 'Excellent suivi du projet', null),

-- Cancelled requests
('Réparation volet roulant', 'Volet roulant du salon bloqué en position basse', (SELECT id FROM categories WHERE slug = 'menuiserie' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), null, 'cancelled', 'normal', 100, 200, null, 'Paris 14ème', 'Volet électrique 10 ans', 'Annulé par le client', null, null, null, null, null, null, null, null, null, null, 'Client a trouvé une solution alternative'),

-- Disputed requests
('Installation alarme maison', 'Installation système d''alarme complet avec détecteurs et centrale', (SELECT id FROM categories WHERE slug = 'electricite' LIMIT 1), (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'martin.electricite@sarl.com' LIMIT 1), 'disputed', 'high', 500, 1000, 750, 'Paris 17ème', 'Maison 120m², 2 étages', 'Litige en cours', null, 'Matériel haut de gamme demandé', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '8 days', null, CURRENT_TIMESTAMP - INTERVAL '5 days', 2, 'Installation incomplète, détecteurs manquants', 3, 'Client pas satisfait du matériel installé', 'Litige à résoudre entre client et artisan')
ON CONFLICT DO NOTHING;

-- Insert conversations and messages for chat functionality
INSERT INTO conversations (participant_1, participant_2, related_request_id, title, last_message_at, is_active) VALUES
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Fuite d''eau sous évier%' LIMIT 1), 'Demande plomberie - Fuite évier', CURRENT_TIMESTAMP - INTERVAL '2 hours', true),
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Peinture salon%' LIMIT 1), 'Peinture salon et couloir', CURRENT_TIMESTAMP - INTERVAL '1 day', true),
((SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Rénovation salle de bain%' LIMIT 1), 'Rénovation salle de bain complète', CURRENT_TIMESTAMP - INTERVAL '30 minutes', true),
((SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Installation étagères%' LIMIT 1), 'Étagères cuisine sur mesure', CURRENT_TIMESTAMP - INTERVAL '3 days', false),
((SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Aménagement terrasse%' LIMIT 1), 'Aménagement terrasse', CURRENT_TIMESTAMP - INTERVAL '1 week', false)
ON CONFLICT DO NOTHING;

-- Insert messages for conversations
INSERT INTO messages (conversation_id, sender_id, content, message_type, is_read, read_at, created_at) VALUES
-- Conversation 1: Marie Dupont - Jean Martin (Plomberie)
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'Bonjour, j''ai une fuite importante sous mon évier de cuisine. Pouvez-vous intervenir rapidement ?', 'text', true, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'Bonjour Madame, je peux venir demain matin vers 9h. Cela vous convient-il ? J''ai de l''expérience avec ce type de réparation.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes'),
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'Parfait ! À demain 9h. Merci beaucoup.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 hour 40 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 40 minutes'),
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'Très bien, je sonnerai au 3ème étage, code 1234A. N''hésitez pas si vous avez des questions.', 'text', false, null, CURRENT_TIMESTAMP - INTERVAL '1 hour 35 minutes'),

-- Conversation 2: Pierre Durand - Marc Lefebvre (Peinture)
((SELECT id FROM conversations WHERE title = 'Peinture salon et couloir' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'Bonjour, j''aimerais repeindre mon salon et couloir en blanc cassé. Quel est votre planning ?', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM conversations WHERE title = 'Peinture salon et couloir' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'Bonjour Monsieur, je peux commencer la semaine prochaine. Avez-vous des préférences pour la peinture (acrylique, glycéro...) ?', 'text', true, CURRENT_TIMESTAMP - INTERVAL '23 hours', CURRENT_TIMESTAMP - INTERVAL '23 hours'),
((SELECT id FROM conversations WHERE title = 'Peinture salon et couloir' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'Peinture acrylique écologique si possible. Les murs sont en bon état.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '22 hours', CURRENT_TIMESTAMP - INTERVAL '22 hours'),

-- Conversation 3: Sophie Laurent - Dupont Peinture SAS (Rénovation)
((SELECT id FROM conversations WHERE title = 'Rénovation salle de bain complète' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), 'Bonjour Madame, nous avons commencé les travaux de peinture. Le carrelage sera posé demain.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
((SELECT id FROM conversations WHERE title = 'Rénovation salle de bain complète' LIMIT 1), (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'Très bien, merci pour la mise à jour. À demain pour la suite.', 'text', false, null, CURRENT_TIMESTAMP - INTERVAL '25 minutes'),

-- Conversation 4: Thomas Robert - Lucas Garcia (Menuiserie)
((SELECT id FROM conversations WHERE title = 'Étagères cuisine sur mesure' LIMIT 1), (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), 'Les étagères sont superbes ! Merci pour ce beau travail.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
((SELECT id FROM conversations WHERE title = 'Étagères cuisine sur mesure' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), 'Merci beaucoup ! N''hésitez pas si vous avez besoin d''ajustements.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Conversation 5: Emma Martin - Antoine Bernard (Jardinage)
((SELECT id FROM conversations WHERE title = 'Aménagement terrasse' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), 'La terrasse est magnifique ! Les plantes sont superbes.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 week', CURRENT_TIMESTAMP - INTERVAL '1 week'),
((SELECT id FROM conversations WHERE title = 'Aménagement terrasse' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), 'Ravi que ça vous plaise ! Les plantes s''adapteront bien à l''exposition.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 week', CURRENT_TIMESTAMP - INTERVAL '1 week')
ON CONFLICT DO NOTHING;

-- Insert conversations and messages for chat functionality
INSERT INTO conversations (participant_1, participant_2, related_request_id, title, last_message_at, is_active) VALUES
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Fuite d''eau sous évier%' LIMIT 1), 'Demande plomberie - Fuite évier', CURRENT_TIMESTAMP - INTERVAL '2 hours', true),
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Peinture salon%' LIMIT 1), 'Peinture salon et couloir', CURRENT_TIMESTAMP - INTERVAL '1 day', true),
((SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Rénovation salle de bain%' LIMIT 1), 'Rénovation salle de bain complète', CURRENT_TIMESTAMP - INTERVAL '30 minutes', true),
((SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Installation étagères%' LIMIT 1), 'Étagères cuisine sur mesure', CURRENT_TIMESTAMP - INTERVAL '3 days', false),
((SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Aménagement terrasse%' LIMIT 1), 'Aménagement terrasse', CURRENT_TIMESTAMP - INTERVAL '1 week', false)
ON CONFLICT DO NOTHING;

-- Insert messages for conversations
INSERT INTO messages (conversation_id, sender_id, content, message_type, is_read, read_at, created_at) VALUES
-- Conversation 1: Marie Dupont - Jean Martin (Plomberie)
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'Bonjour, j''ai une fuite importante sous mon évier de cuisine. Pouvez-vous intervenir rapidement ?', 'text', true, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'Bonjour Madame, je peux venir demain matin vers 9h. Cela vous convient-il ? J''ai de l''expérience avec ce type de réparation.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes'),
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'Parfait ! À demain 9h. Merci beaucoup.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 hour 40 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 40 minutes'),
((SELECT id FROM conversations WHERE title = 'Demande plomberie - Fuite évier' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'Très bien, je sonnerai au 3ème étage, code 1234A. N''hésitez pas si vous avez des questions.', 'text', false, null, CURRENT_TIMESTAMP - INTERVAL '1 hour 35 minutes'),

-- Conversation 2: Pierre Durand - Marc Lefebvre (Peinture)
((SELECT id FROM conversations WHERE title = 'Peinture salon et couloir' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'Bonjour, j''aimerais repeindre mon salon et couloir en blanc cassé. Quel est votre planning ?', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM conversations WHERE title = 'Peinture salon et couloir' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'Bonjour Monsieur, je peux commencer la semaine prochaine. Avez-vous des préférences pour la peinture (acrylique, glycéro...) ?', 'text', true, CURRENT_TIMESTAMP - INTERVAL '23 hours', CURRENT_TIMESTAMP - INTERVAL '23 hours'),
((SELECT id FROM conversations WHERE title = 'Peinture salon et couloir' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'Peinture acrylique écologique si possible. Les murs sont en bon état.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '22 hours', CURRENT_TIMESTAMP - INTERVAL '22 hours'),

-- Conversation 3: Sophie Laurent - Dupont Peinture SAS (Rénovation)
((SELECT id FROM conversations WHERE title = 'Rénovation salle de bain complète' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), 'Bonjour Madame, nous avons commencé les travaux de peinture. Le carrelage sera posé demain.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
((SELECT id FROM conversations WHERE title = 'Rénovation salle de bain complète' LIMIT 1), (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'Très bien, merci pour la mise à jour. À demain pour la suite.', 'text', false, null, CURRENT_TIMESTAMP - INTERVAL '25 minutes'),

-- Conversation 4: Thomas Robert - Lucas Garcia (Menuiserie)
((SELECT id FROM conversations WHERE title = 'Étagères cuisine sur mesure' LIMIT 1), (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), 'Les étagères sont superbes ! Merci pour ce beau travail.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
((SELECT id FROM conversations WHERE title = 'Étagères cuisine sur mesure' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), 'Merci beaucoup ! N''hésitez pas si vous avez besoin d''ajustements.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Conversation 5: Emma Martin - Antoine Bernard (Jardinage)
((SELECT id FROM conversations WHERE title = 'Aménagement terrasse' LIMIT 1), (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), 'La terrasse est magnifique ! Les plantes sont superbes.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 week', CURRENT_TIMESTAMP - INTERVAL '1 week'),
((SELECT id FROM conversations WHERE title = 'Aménagement terrasse' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), 'Ravi que ça vous plaise ! Les plantes s''adapteront bien à l''exposition.', 'text', true, CURRENT_TIMESTAMP - INTERVAL '1 week', CURRENT_TIMESTAMP - INTERVAL '1 week')
ON CONFLICT DO NOTHING;

-- Insert comprehensive reports
INSERT INTO reports (reporter_id, reported_user_id, reported_request_id, type, title, description, evidence, status, priority, assigned_admin_id, resolution, resolution_actions, created_at, updated_at, resolved_at) VALUES
-- Service quality reports
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), null, 'service_quality', 'Travail non terminé', 'L''artisan n''a pas terminé le travail commencé et a quitté le chantier sans prévenir', ARRAY['photo_chantier.jpg'], 'pending', 'high', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), null, null, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days', null),
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Peinture salon%' LIMIT 1), 'service_quality', 'Retard important', 'Artisan arrivé avec 2h de retard sans prévenir, travail bâclé', null, 'investigating', 'medium', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), null, null, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days', null),

-- Billing reports
((SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Installation étagères%' LIMIT 1), 'billing', 'Facture excessive', 'La facture finale dépasse largement le devis initial (+40%) sans justification', ARRAY['devis_initial.pdf', 'facture_finale.pdf'], 'resolved', 'medium', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'Remboursement partiel accordé au client', ARRAY['remboursement_100€', 'avertissement_artisan'], CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
((SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Aménagement terrasse%' LIMIT 1), 'billing', 'Frais supplémentaires non prévus', 'Artisan a ajouté des frais pour "suppléments imprévus" non mentionnés', null, 'pending', 'low', null, null, null, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days', null),

-- Behavior reports
((SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Rénovation salle de bain%' LIMIT 1), 'behavior', 'Comportement inapproprié', 'Propos déplacés et menaces proférées par un employé de l''entreprise', null, 'resolved', 'high', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'Employé licencié, excuses présentées', ARRAY['licenciement_employe', 'excuses_ecrites'], CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '13 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.dubois@artisan.com' LIMIT 1), null, 'behavior', 'Non-respect des horaires', 'Artisan qui ne respecte jamais les horaires convenus, arrive toujours en retard', null, 'pending', 'medium', null, null, null, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days', null),

-- Fraud reports
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'martin.electricite@sarl.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Installation alarme%' LIMIT 1), 'fraud', 'Matériel non conforme', 'Matériel installé ne correspond pas à ce qui était commandé, qualité inférieure', ARRAY['photo_materiel.jpg', 'bon_commande.pdf'], 'investigating', 'high', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), null, null, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 days', null)
ON CONFLICT DO NOTHING;

-- Insert analytics events to generate real statistics
-- User registration events
INSERT INTO analytics_events (event_type, event_data, user_id, session_id, ip_address, user_agent, created_at) VALUES
('user_registration', '{"role": "client", "source": "website"}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_001', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('user_registration', '{"role": "worker", "source": "mobile_app"}', (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'sess_002', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '28 days'),
('user_registration', '{"role": "client", "source": "website"}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_003', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '25 days'),
('user_registration', '{"role": "worker", "source": "website"}', (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'sess_004', '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '22 days'),
('user_registration', '{"role": "client", "source": "google_ads"}', (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'sess_005', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '20 days'),

-- Request creation events
('request_created', '{"category": "plomberie", "budget_min": 80, "budget_max": 150}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_006', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('request_created', '{"category": "electricite", "budget_min": 60, "budget_max": 120}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_007', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('request_created', '{"category": "peinture", "budget_min": 200, "budget_max": 400}', (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'sess_008', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('request_created', '{"category": "menuiserie", "budget_min": 100, "budget_max": 200}', (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), 'sess_009', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('request_created', '{"category": "jardinage", "budget_min": 80, "budget_max": 150}', (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), 'sess_010', '192.168.1.106', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '6 days'),

-- Request completion events
('request_completed', '{"category": "peinture", "final_budget": 420, "duration_days": 7}', (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), 'sess_011', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('request_completed', '{"category": "menuiserie", "final_budget": 580, "duration_days": 8}', (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), 'sess_012', '192.168.1.106', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('request_completed', '{"category": "jardinage", "final_budget": 1200, "duration_days": 10}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_013', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '15 days'),

-- User login events (for active user tracking)
('user_login', '{"device": "desktop"}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_014', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('user_login', '{"device": "mobile"}', (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'sess_015', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('user_login', '{"device": "desktop"}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_016', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('user_login', '{"device": "mobile"}', (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'sess_017', '192.168.1.103', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('user_login', '{"device": "desktop"}', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'sess_018', '192.168.1.107', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

-- Search and browsing events
('search_performed', '{"query": "plomberie", "results_count": 15}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_014', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes'),
('category_viewed', '{"category": "electricite", "duration_seconds": 120}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_016', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes'),
('worker_profile_viewed', '{"worker_id": "jean.martin@artisan.com", "duration_seconds": 180}', (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'sess_019', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '45 minutes')
ON CONFLICT DO NOTHING;

-- Insert user sessions for active session tracking
INSERT INTO user_sessions (user_id, token_hash, expires_at, is_active, created_at, last_activity) VALUES
((SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'hash_admin_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'hash_marie_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
((SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'hash_jean_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'hash_pierre_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
((SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'hash_marc_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '25 minutes')
ON CONFLICT DO NOTHING;
-- Insert comprehensive reports
INSERT INTO reports (reporter_id, reported_user_id, reported_request_id, type, title, description, evidence, status, priority, assigned_admin_id, resolution, resolution_actions, created_at, updated_at, resolved_at) VALUES
-- Service quality reports
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), null, 'service_quality', 'Travail non terminé', 'L''artisan n''a pas terminé le travail commencé et a quitté le chantier sans prévenir', ARRAY['photo_chantier.jpg'], 'pending', 'high', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), null, null, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days', null),
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Peinture salon%' LIMIT 1), 'service_quality', 'Retard important', 'Artisan arrivé avec 2h de retard sans prévenir, travail bâclé', null, 'investigating', 'medium', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), null, null, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days', null),

-- Billing reports
((SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'lucas.garcia@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Installation étagères%' LIMIT 1), 'billing', 'Facture excessive', 'La facture finale dépasse largement le devis initial (+40%) sans justification', ARRAY['devis_initial.pdf', 'facture_finale.pdf'], 'resolved', 'medium', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'Remboursement partiel accordé au client', ARRAY['remboursement_100€', 'avertissement_artisan'], CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
((SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'antoine.bernard@artisan.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Aménagement terrasse%' LIMIT 1), 'billing', 'Frais supplémentaires non prévus', 'Artisan a ajouté des frais pour "suppléments imprévus" non mentionnés', null, 'pending', 'low', null, null, null, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days', null),

-- Behavior reports
((SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'dupont.peinture@sas.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Rénovation salle de bain%' LIMIT 1), 'behavior', 'Comportement inapproprié', 'Propos déplacés et menaces proférées par un employé de l''entreprise', null, 'resolved', 'high', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'Employé licencié, excuses présentées', ARRAY['licenciement_employe', 'excuses_ecrites'], CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '13 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'pierre.dubois@artisan.com' LIMIT 1), null, 'behavior', 'Non-respect des horaires', 'Artisan qui ne respecte jamais les horaires convenus, arrive toujours en retard', null, 'pending', 'medium', null, null, null, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days', null),

-- Fraud reports
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), (SELECT id FROM users WHERE email = 'martin.electricite@sarl.com' LIMIT 1), (SELECT id FROM requests WHERE title LIKE '%Installation alarme%' LIMIT 1), 'fraud', 'Matériel non conforme', 'Matériel installé ne correspond pas à ce qui était commandé, qualité inférieure', ARRAY['photo_materiel.jpg', 'bon_commande.pdf'], 'investigating', 'high', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), null, null, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 days', null)
ON CONFLICT DO NOTHING;

-- Insert analytics events to generate real statistics
INSERT INTO analytics_events (event_type, event_data, user_id, session_id, ip_address, user_agent, created_at) VALUES
-- User registration events
('user_registration', '{"role": "client", "source": "website"}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_001', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('user_registration', '{"role": "worker", "source": "mobile_app"}', (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'sess_002', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '28 days'),
('user_registration', '{"role": "client", "source": "website"}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_003', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '25 days'),
('user_registration', '{"role": "worker", "source": "website"}', (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'sess_004', '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '22 days'),
('user_registration', '{"role": "client", "source": "google_ads"}', (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'sess_005', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '20 days'),

-- Request creation events
('request_created', '{"category": "plomberie", "budget_min": 80, "budget_max": 150}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_006', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('request_created', '{"category": "electricite", "budget_min": 60, "budget_max": 120}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_007', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('request_created', '{"category": "peinture", "budget_min": 200, "budget_max": 400}', (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'sess_008', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('request_created', '{"category": "menuiserie", "budget_min": 100, "budget_max": 200}', (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), 'sess_009', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('request_created', '{"category": "jardinage", "budget_min": 80, "budget_max": 150}', (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), 'sess_010', '192.168.1.106', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '6 days'),

-- Request completion events
('request_completed', '{"category": "peinture", "final_budget": 420, "duration_days": 7}', (SELECT id FROM users WHERE email = 'thomas.robert@email.com' LIMIT 1), 'sess_011', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('request_completed', '{"category": "menuiserie", "final_budget": 580, "duration_days": 8}', (SELECT id FROM users WHERE email = 'emma.martin@email.com' LIMIT 1), 'sess_012', '192.168.1.106', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('request_completed', '{"category": "jardinage", "final_budget": 1200, "duration_days": 10}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_013', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '15 days'),

-- User login events (for active user tracking)
('user_login', '{"device": "desktop"}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_014', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('user_login', '{"device": "mobile"}', (SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'sess_015', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('user_login', '{"device": "desktop"}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_016', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('user_login', '{"device": "mobile"}', (SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'sess_017', '192.168.1.103', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('user_login', '{"device": "desktop"}', (SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'sess_018', '192.168.1.107', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

-- Search and browsing events
('search_performed', '{"query": "plomberie", "results_count": 15}', (SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'sess_014', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes'),
('category_viewed', '{"category": "electricite", "duration_seconds": 120}', (SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'sess_016', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes'),
('worker_profile_viewed', '{"worker_id": "jean.martin@artisan.com", "duration_seconds": 180}', (SELECT id FROM users WHERE email = 'sophie.laurent@email.com' LIMIT 1), 'sess_019', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36', CURRENT_TIMESTAMP - INTERVAL '45 minutes')
ON CONFLICT DO NOTHING;

-- Insert user sessions for active session tracking
INSERT INTO user_sessions (user_id, token_hash, expires_at, is_active, created_at, last_activity) VALUES
((SELECT id FROM users WHERE email = 'admin@allobbrico.com' LIMIT 1), 'hash_admin_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
((SELECT id FROM users WHERE email = 'marie.dupont@email.com' LIMIT 1), 'hash_marie_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
((SELECT id FROM users WHERE email = 'jean.martin@artisan.com' LIMIT 1), 'hash_jean_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
((SELECT id FROM users WHERE email = 'pierre.durand@email.com' LIMIT 1), 'hash_pierre_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
((SELECT id FROM users WHERE email = 'marc.lefebvre@artisan.com' LIMIT 1), 'hash_marc_session_001', CURRENT_TIMESTAMP + INTERVAL '24 hours', true, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '25 minutes')
ON CONFLICT DO NOTHING;
