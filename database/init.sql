-- Allobbrico Database Schema
-- PostgreSQL initialization script

-- Create database (if not exists)
-- Note: This would typically be done by the Docker Compose setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (clients, workers, admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'worker', 'admin')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended', 'rejected')),

    -- Client specific fields
    address TEXT,
    preferences TEXT[], -- Array of preferred service categories

    -- Worker specific fields
    specialty VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    jobs_completed INTEGER DEFAULT 0,
    worker_status VARCHAR(20) DEFAULT 'available' CHECK (worker_status IN ('available', 'busy', 'offline')),
    location VARCHAR(255),
    worker_type VARCHAR(20) CHECK (worker_type IN ('artisan', 'company')),
    accepts_urgent BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2),
    description TEXT,
    skills TEXT[],
    certifications TEXT[],
    portfolio_urls TEXT[],

    -- Admin specific fields
    admin_level VARCHAR(20) DEFAULT 'standard' CHECK (admin_level IN ('standard', 'super')),

    -- Metadata
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects/Requests table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    client_id UUID NOT NULL REFERENCES users(id),
    assigned_worker_id UUID REFERENCES users(id),

    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    final_budget DECIMAL(10,2),

    location VARCHAR(255),
    location_details TEXT,
    preferred_schedule TEXT,

    attachments TEXT[], -- Array of file URLs
    requirements TEXT,

    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,

    client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
    client_review TEXT,
    worker_rating INTEGER CHECK (worker_rating >= 1 AND worker_rating <= 5),
    worker_review TEXT,

    admin_notes TEXT,
    cancellation_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_user_id UUID REFERENCES users(id),
    reported_request_id UUID REFERENCES requests(id),

    type VARCHAR(50) NOT NULL, -- 'service_quality', 'billing', 'behavior', 'fraud', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT[], -- Array of file URLs

    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    assigned_admin_id UUID REFERENCES users(id),
    resolution TEXT,
    resolution_actions TEXT[], -- Array of actions taken

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Offers table (worker offers for service requests)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    timeline VARCHAR(100),
    availability TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT different_participants CHECK (participant_1 != participant_2),
    CONSTRAINT unique_conversation_participants UNIQUE(participant_1, participant_2, COALESCE(related_request_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- Messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),

    attachments TEXT[], -- Array of file URLs
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- 'platform', 'notifications', 'security', 'pricing'
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(category, key)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_worker_id ON requests(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_requests_category_id ON requests(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_worker_id ON offers(worker_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_request_id ON conversations(related_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('Plomberie', 'plomberie', 'Services de plomberie et réparation', 'Wrench', 'blue', 1),
('Électricité', 'electricite', 'Travaux électriques et installations', 'Zap', 'yellow', 2),
('Peinture', 'peinture', 'Peinture intérieure et extérieure', 'Palette', 'green', 3),
('Menuiserie', 'menuiserie', 'Travaux de bois et menuiserie', 'Hammer', 'orange', 4),
('Jardinage', 'jardinage', 'Aménagement et entretien d''espaces verts', 'Leaf', 'green', 5),
('Climatisation', 'climatisation', 'Installation et réparation climatisations', 'Snowflake', 'blue', 6),
('Chauffage', 'chauffage', 'Systèmes de chauffage et chaudières', 'Flame', 'red', 7),
('Rénovation', 'renovation', 'Rénovation générale et travaux', 'Home', 'gray', 8),
('Autre', 'autre', 'Autres services', 'MoreHorizontal', 'gray', 9)
ON CONFLICT (slug) DO NOTHING;

-- Insert default platform settings
INSERT INTO platform_settings (category, key, value, description) VALUES
('platform', 'name', '"Allobbrico"', 'Platform name'),
('platform', 'maintenance', 'false', 'Maintenance mode enabled'),
('platform', 'registration_enabled', 'true', 'User registration enabled'),
('notifications', 'email_enabled', 'true', 'Email notifications enabled'),
('notifications', 'sms_enabled', 'false', 'SMS notifications enabled'),
('notifications', 'push_enabled', 'true', 'Push notifications enabled'),
('security', 'password_min_length', '8', 'Minimum password length'),
('security', 'session_timeout', '24', 'Session timeout in hours'),
('security', 'two_factor_enabled', 'false', 'Two-factor authentication enabled'),
('pricing', 'platform_fee', '5', 'Platform fee percentage'),
('pricing', 'artisan_commission', '10', 'Artisan commission percentage')
ON CONFLICT (category, key) DO NOTHING;

-- Insert sample users for testing (passwords are hashed 'password123')
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, status, email_verified, phone_verified) VALUES
('admin@allobbrico.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Admin', 'System', '+33123456789', 'admin', 'active', true, true),
('client1@example.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Marie', 'Dubois', '+33612345678', 'client', 'active', true, true),
('worker1@example.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Jean', 'Martin', '+33712345678', 'worker', 'active', true, true),
('worker2@example.com', '$2b$10$rOz8vZKQ8c5QX8QX8QX8QOX8QX8QX8QX8QX8QX8QX8QX8QX8QX8Q', 'Pierre', 'Durand', '+33812345678', 'worker', 'active', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample requests
INSERT INTO requests (title, description, category_id, client_id, status, priority, budget_min, budget_max, location) VALUES
('Réparation fuite eau', 'Fuite sous l''évier de la cuisine', (SELECT id FROM categories WHERE slug = 'plomberie' LIMIT 1), (SELECT id FROM users WHERE email = 'client1@example.com' LIMIT 1), 'open', 'urgent', 50, 150, 'Paris 15e'),
('Installation prise électrique', 'Besoin d''une nouvelle prise dans le salon', (SELECT id FROM categories WHERE slug = 'electricite' LIMIT 1), (SELECT id FROM users WHERE email = 'client1@example.com' LIMIT 1), 'assigned', 'normal', 80, 120, 'Paris 12e'),
('Peinture chambre enfant', 'Repeindre la chambre de mon fils en bleu', (SELECT id FROM categories WHERE slug = 'peinture' LIMIT 1), (SELECT id FROM users WHERE email = 'client1@example.com' LIMIT 1), 'completed', 'normal', 200, 400, 'Paris 10e')
ON CONFLICT DO NOTHING;

-- Insert sample reports
INSERT INTO reports (reporter_id, reported_user_id, type, title, description, status, priority) VALUES
((SELECT id FROM users WHERE email = 'client1@example.com' LIMIT 1), (SELECT id FROM users WHERE email = 'worker1@example.com' LIMIT 1), 'service_quality', 'Travail non terminé', 'L''artisan n''a pas terminé le travail commencé', 'pending', 'high'),
((SELECT id FROM users WHERE email = 'client1@example.com' LIMIT 1), (SELECT id FROM users WHERE email = 'worker2@example.com' LIMIT 1), 'billing', 'Facture excessive', 'La facture finale dépasse largement le devis initial', 'investigating', 'normal')
ON CONFLICT DO NOTHING;