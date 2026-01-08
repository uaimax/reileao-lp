-- Bio Page Database Schema Extension
-- This adds tables for bio links and analytics to the existing UAIZOUK schema

-- Bio Links Table
CREATE TABLE IF NOT EXISTS bio_links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_scheduled BOOLEAN DEFAULT false,
    schedule_start TIMESTAMP NULL,
    schedule_end TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bio Analytics Table
CREATE TABLE IF NOT EXISTS bio_analytics (
    id SERIAL PRIMARY KEY,
    bio_link_id INTEGER NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    referrer TEXT,
    ip_address INET,
    FOREIGN KEY (bio_link_id) REFERENCES bio_links(id) ON DELETE CASCADE
);

-- Bio Configuration Table (for event logo and other bio settings)
CREATE TABLE IF NOT EXISTS bio_config (
    id SERIAL PRIMARY KEY,
    event_logo_url TEXT,
    show_event_date BOOLEAN DEFAULT true,
    show_trailer_button BOOLEAN DEFAULT true,
    bio_title VARCHAR(255) DEFAULT NULL, -- Optional custom title override
    bio_subtitle VARCHAR(500) DEFAULT NULL, -- Optional custom subtitle override
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bio_links_active_order ON bio_links (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_bio_links_scheduled ON bio_links (is_scheduled, schedule_start, schedule_end);
CREATE INDEX IF NOT EXISTS idx_bio_analytics_link_id ON bio_analytics (bio_link_id);
CREATE INDEX IF NOT EXISTS idx_bio_analytics_clicked_at ON bio_analytics (clicked_at);

-- Create update timestamp triggers
CREATE TRIGGER update_bio_links_updated_at BEFORE UPDATE ON bio_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bio_config_updated_at BEFORE UPDATE ON bio_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default bio configuration
INSERT INTO bio_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert sample bio links
INSERT INTO bio_links (title, url, display_order, is_active) VALUES
('🎫 Inscrições UAIZOUK 2025', 'https://uaizouk.com.br/inscricoes', 1, true),
('📍 Localização do Evento', 'https://maps.google.com/maps?q=Recanto+da+Lua,+Uberlândia,+MG', 2, true),
('🏨 Hospedagem Recomendada', 'https://www.booking.com/searchresults.pt-br.html?ss=Uberlândia', 3, true),
('📞 Contato WhatsApp', 'https://api.whatsapp.com/send?phone=5534999999999&text=Oi!%20Quero%20mais%20informações%20sobre%20o%20UAIZOUK', 4, true),
('📱 Instagram Oficial', 'https://www.instagram.com/uaizouk/', 5, true),
('🎵 Playlist Oficial', 'https://open.spotify.com/playlist/uaizouk2025', 6, true)
ON CONFLICT DO NOTHING;