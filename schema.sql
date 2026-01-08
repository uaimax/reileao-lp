-- UAIZOUK Landing Page Database Schema
-- This schema supports all dynamic content management for the landing page

-- Event Configuration Table
CREATE TABLE IF NOT EXISTS event_config (
    id SERIAL PRIMARY KEY,
    event_title VARCHAR(255) NOT NULL DEFAULT 'UAIZOUK 2025',
    event_subtitle VARCHAR(500) NOT NULL DEFAULT 'UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO',
    event_tagline VARCHAR(255) NOT NULL DEFAULT 'Muita aula. Muita dança. Muito Zouk.',
    event_date_display VARCHAR(100) NOT NULL DEFAULT '5–7 SET 2025, Uberlândia–MG',
    event_countdown_target TIMESTAMP NOT NULL DEFAULT '2025-09-05 14:00:00-03',
    event_countdown_text VARCHAR(255) NOT NULL DEFAULT 'A experiência completa inicia em:',
    hero_video_url TEXT DEFAULT 'https://www.youtube.com/embed/U2QPiVaMAVc?autoplay=1&mute=1&loop=1&playlist=U2QPiVaMAVc&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=0',
    registration_url TEXT NOT NULL DEFAULT 'https://uaizouk.com.br/inscricoes',
    s3_endpoint VARCHAR(255),
    s3_access_key VARCHAR(255),
    s3_secret_key VARCHAR(255),
    s3_bucket_name VARCHAR(255),
    s3_region VARCHAR(100),
    s3_public_domain VARCHAR(255),
    s3_enabled BOOLEAN DEFAULT false,
    whatsapp_number VARCHAR(20) DEFAULT '',
    whatsapp_message TEXT DEFAULT 'Oi! Quero mais informações sobre o UAIZOUK',
    whatsapp_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_image_url TEXT
);

-- Hero Section Content
CREATE TABLE IF NOT EXISTS hero_content (
    id SERIAL PRIMARY KEY,
    cta_primary_text VARCHAR(100) NOT NULL DEFAULT 'QUERO SABER MAIS',
    cta_secondary_text VARCHAR(100) NOT NULL DEFAULT 'PULAR PARA INGRESSOS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About Section (Entenda) Content
CREATE TABLE IF NOT EXISTS about_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Entenda o UAIZOUK',
    paragraph_1 TEXT NOT NULL DEFAULT 'Serão 3 dias de imersão presencial para respirar Zouk do início ao fim, com conteúdo selecionado e diversidade de professores e djs que conduzem toda a programação.',
    paragraph_2 TEXT NOT NULL DEFAULT 'Ao longo de todos esses anos de UAIZOUK nós contamos com participantes de todos os níveis das mais diversas cidades do Brasil e do mundo.',
    paragraph_3 TEXT NOT NULL DEFAULT 'O Congresso UAIZOUK é a junção perfeita entre aprendizado para todos os níveis em um ambiente de socialização completo.',
    trailer_video_url TEXT DEFAULT 'https://www.youtube.com/embed/5Q7hGUc3fMY?autoplay=1&mute=1',
    trailer_button_text VARCHAR(100) NOT NULL DEFAULT 'Veja um breve trailer',
    beginner_title VARCHAR(255) NOT NULL DEFAULT 'Se você é iniciante...',
    beginner_text TEXT NOT NULL DEFAULT 'prepare-se para aulas que vão desenvolver sua base, mas também a experiência real de uma balada de Zouk com pessoas que praticam em lugares totalmente diferentes.',
    advanced_title VARCHAR(255) NOT NULL DEFAULT 'Se você é intermediário ou avançado...',
    advanced_text TEXT NOT NULL DEFAULT 'prepare-se para aprofundar as técnicas e aprender com professores que rodam o mundo levando o Zouk.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statistics/Counter Section
CREATE TABLE IF NOT EXISTS stats_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Já passaram pelo UAIZOUK mais de',
    participants_count INTEGER NOT NULL DEFAULT 3190,
    participants_label VARCHAR(100) NOT NULL DEFAULT 'Participantes',
    teachers_count INTEGER NOT NULL DEFAULT 56,
    teachers_label VARCHAR(100) NOT NULL DEFAULT 'Professores',
    djs_count INTEGER NOT NULL DEFAULT 25,
    djs_label VARCHAR(100) NOT NULL DEFAULT 'DJs',
    party_hours_count INTEGER NOT NULL DEFAULT 300,
    party_hours_label VARCHAR(100) NOT NULL DEFAULT 'Horas de balada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists Table (expanding on existing structure)
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL, -- 'Professor', 'DJ', 'DJ e MC', etc.
    city_state VARCHAR(100) NOT NULL, -- 'SP', 'RJ', etc.
    photo_url TEXT,
    description TEXT,
    promotional_video_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists Section Content
CREATE TABLE IF NOT EXISTS artists_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Artistas Confirmados',
    section_subtitle TEXT NOT NULL DEFAULT 'Professores e DJs renomados que farão parte desta experiência única',
    cta_button_text VARCHAR(100) NOT NULL DEFAULT 'QUERO PARTICIPAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table (expanding on existing structure)
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_state VARCHAR(255) NOT NULL,
    testimonial_text TEXT NOT NULL,
    photo_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Section Content
CREATE TABLE IF NOT EXISTS testimonials_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Depoimentos',
    section_subtitle TEXT NOT NULL DEFAULT 'O que nossos participantes dizem sobre a experiência UAIZOUK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- City/Location Section Content
CREATE TABLE IF NOT EXISTS location_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Uberlândia, MG',
    section_subtitle TEXT NOT NULL DEFAULT 'O evento oficial acontece sempre em Uberlândia (Minas Gerais)',
    description_paragraph_1 TEXT NOT NULL DEFAULT 'Recentemente a cidade foi classificada pela International Congress and Convention Association (ICCA) (a principal entidade do segmento de turismo e eventos internacionais) como uma das cidades brasileiras que mais sedia eventos internacionais, ficando na nona posição.',
    description_paragraph_2 TEXT NOT NULL DEFAULT 'Entre as doze cidades melhores colocadas, Uberlândia é a única que não é capital.',
    travel_info_title VARCHAR(255) NOT NULL DEFAULT 'Como chegar em Uberlândia:',
    travel_info_sp VARCHAR(255) NOT NULL DEFAULT '50 minutos de São Paulo (voo) / 8 horas de ônibus',
    travel_info_bh VARCHAR(255) NOT NULL DEFAULT '50 minutos de Belo Horizonte (voo) / 10 horas de ônibus',
    travel_info_rj VARCHAR(255) NOT NULL DEFAULT '60 minutos do Rio de Janeiro (voo)',
    venue_title VARCHAR(255) NOT NULL DEFAULT 'O local do UAIZOUK 2025',
    venue_description TEXT NOT NULL DEFAULT 'O UAIZOUK acontece no Recanto da Lua, uma chácara dentro da cidade no bairro Chácaras Panorama.',
    venue_video_url TEXT DEFAULT 'https://www.youtube.com/embed/sDHDoiNoMjU?autoplay=1',
    hotel_booking_url TEXT NOT NULL DEFAULT 'https://www.booking.com/searchresults.pt-br.html?ss=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&ssne=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&ssne_untouched=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&highlighted_hotels=776746&efdco=1&label=New_Portuguese_PT_ROW_6409090206-_9oPl604g33uUPimd0_L7QS60966725406%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=175071b8c7e991c1b3e84c4dc897231e&aid=360920&lang=pt-br&sb=1&src=searchresults&latitude=-18.9664786&longitude=-48.349411&checkin=2024-09-05&checkout=2024-09-09&group_adults=2&no_rooms=1&group_children=0',
    hotel_button_text VARCHAR(100) NOT NULL DEFAULT 'Lista de hotéis',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participation Section Content
CREATE TABLE IF NOT EXISTS participation_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Como Participar',
    main_title VARCHAR(255) NOT NULL DEFAULT 'Você NÃO PRECISA de um par para se inscrever no UAIZOUK',
    paragraph_1 TEXT NOT NULL DEFAULT 'Você pode se inscrever individualmente, e acredite, você será muito bem recebido(a) por todos os participantes, acolhido(a) como o Luís foi (entenda aqui).',
    paragraph_2 TEXT NOT NULL DEFAULT 'Agora, se você formar um par, com amigo(a), aí você terá um desconto.',
    paragraph_3 TEXT NOT NULL DEFAULT 'Ambos precisarão se inscrever normalmente, mas ambos terão desconto.',
    paragraph_4 TEXT NOT NULL DEFAULT 'Os valores atualizados ficam na página de inscrição, confira abaixo',
    cta_button_text VARCHAR(100) NOT NULL DEFAULT 'QUERO PARTICIPAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Footer Content
CREATE TABLE IF NOT EXISTS footer_content (
    id SERIAL PRIMARY KEY,
    event_title VARCHAR(255) NOT NULL DEFAULT 'UAIZOUK 2025',
    event_description TEXT NOT NULL DEFAULT 'Uma imersão completa nas possibilidades do Zouk Brasileiro',
    event_dates VARCHAR(100) NOT NULL DEFAULT '05 a 07 de Setembro',
    event_location VARCHAR(255) NOT NULL DEFAULT 'Uberlândia, MG',
    venue_name VARCHAR(255) NOT NULL DEFAULT 'Recanto da Lua',
    venue_area VARCHAR(255) NOT NULL DEFAULT 'Chácaras Panorama',
    copyright_text VARCHAR(255) NOT NULL DEFAULT '© 2025 UAIZOUK. Todos os direitos reservados.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redirects Table
CREATE TABLE IF NOT EXISTS redirects (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(255) NOT NULL UNIQUE,
    target_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values
INSERT INTO event_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO hero_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO about_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO stats_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO artists_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO testimonials_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO location_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO participation_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO footer_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert sample artists data
INSERT INTO artists (name, role, city_state, photo_url, description, display_order, is_active) VALUES
('Luan e Adriana', 'Professores Confirmados', 'SP', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400', 'Professores renomados de Zouk', 1, true),
('Zen Eyer', 'DJ', 'RJ', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&h=400', 'DJ especializado em Zouk', 2, true),
('DJ Ju Sanper', 'DJ e MC', 'SP', 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=400&h=400', 'DJ e MC', 3, true),
('DJ Zé do Lago', 'DJ', 'SP', 'https://images.unsplash.com/photo-1501286353178-1ec881214838?auto=format&fit=crop&w=400&h=400', 'DJ', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials data
INSERT INTO testimonials (name, city_state, testimonial_text, display_order, is_active) VALUES
('Trícia', 'Belém (PA)', 'Esta foi minha 2° vez no UaiZouk e posso dizer com toda certeza que não existe congresso melhor. A conexão que existe entre as pessoas, o carinho, acolhimento e cuidado da equipe (maravilhosa!), os bailes incríveis (sério, os melhores bailes de zouk de todos!). Sou APAIXONADA por este evento. Quem gosta de zouk ou quer conhecer o ritmo PRECISA viver o UZ!', 1, true),
('Andressa', 'Uberlândia (MG)', 'É simplesmente o congresso que me deixa noites sem dormir de ansiedade quando está chegando e quase chorando quando acaba! Imersão maravilhosa com profissionais incríveis e congressistas de todas as partes do Brasil!!! Só venham!!!!', 2, true),
('Fred', 'Ribeirão Preto (SP)', 'Mais um ano que revejo amigos queridos e volto pra casa com minha bateria totalmente carregada', 3, true),
('Paulo Pinto', 'Campinas (SP)', 'Vou ao UAIZOUK desde que descobri sua existência em 2017 e tenho um enorme carinho por ele visto que, por meio dele, pude ter a percepção de que há n caminhos na dança, dentre os quais podemos priorizar elementos como conexão, respiração e cuidado.', 4, true)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_active_order ON artists (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON testimonials (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_redirects_active_order ON redirects (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_redirects_alias ON redirects (alias) WHERE is_active = true;

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_event_config_updated_at BEFORE UPDATE ON event_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_content_updated_at BEFORE UPDATE ON hero_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON about_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stats_content_updated_at BEFORE UPDATE ON stats_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artists_content_updated_at BEFORE UPDATE ON artists_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_content_updated_at BEFORE UPDATE ON testimonials_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_content_updated_at BEFORE UPDATE ON location_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participation_content_updated_at BEFORE UPDATE ON participation_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_footer_content_updated_at BEFORE UPDATE ON footer_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email) WHERE is_active = true;

-- Add trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: maxmax123)
INSERT INTO users (email, password_hash) VALUES
('lmax00@gmail.com', '$2b$12$9y5Q8zUQr6YLqGbGHqxVE.K7QxDgLQ7wGY1XYm8JvQGKqvJqYyA3q')
ON CONFLICT (email) DO NOTHING;

-- Bio Page Tables
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
    bio_title VARCHAR(255) DEFAULT NULL,
    bio_subtitle VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for bio tables
CREATE INDEX IF NOT EXISTS idx_bio_links_active_order ON bio_links (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_bio_links_scheduled ON bio_links (is_scheduled, schedule_start, schedule_end);
CREATE INDEX IF NOT EXISTS idx_bio_analytics_link_id ON bio_analytics (bio_link_id);
CREATE INDEX IF NOT EXISTS idx_bio_analytics_clicked_at ON bio_analytics (clicked_at);

-- Create update timestamp triggers for bio tables
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

-- FAQ (Frequently Asked Questions) Table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Section Content
CREATE TABLE IF NOT EXISTS faq_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Perguntas Frequentes',
    section_subtitle TEXT NOT NULL DEFAULT 'Tire suas dúvidas sobre o UAIZOUK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for FAQ table
CREATE INDEX IF NOT EXISTS idx_faqs_active_order ON faqs (is_active, display_order);

-- Create update timestamp trigger for FAQ tables
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_content_updated_at BEFORE UPDATE ON faq_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default FAQ content configuration
INSERT INTO faq_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ===== PRIMEIRINHO TABLES =====

-- PRIMEIRINHO Leads Table
CREATE TABLE IF NOT EXISTS primeirinho_leads (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'confirmed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cidades Configuradas Table (cities that already have representatives)
CREATE TABLE IF NOT EXISTS cidades_configuradas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for PRIMEIRINHO tables
CREATE INDEX IF NOT EXISTS idx_primeirinho_leads_uuid ON primeirinho_leads (uuid);
CREATE INDEX IF NOT EXISTS idx_primeirinho_leads_status ON primeirinho_leads (status);
CREATE INDEX IF NOT EXISTS idx_primeirinho_leads_estado_cidade ON primeirinho_leads (estado, cidade);
CREATE INDEX IF NOT EXISTS idx_cidades_configuradas_estado ON cidades_configuradas (estado);
CREATE INDEX IF NOT EXISTS idx_cidades_configuradas_estado_nome ON cidades_configuradas (estado, nome);

-- Create update timestamp trigger for PRIMEIRINHO leads
CREATE TRIGGER update_primeirinho_leads_updated_at BEFORE UPDATE ON primeirinho_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== EVENT FORM CONFIGURATION SYSTEM =====

-- Event Form Configurations Table
CREATE TABLE IF NOT EXISTS event_form_configs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event_config(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event_config(id) ON DELETE CASCADE,
    cpf VARCHAR(14),
    is_foreigner BOOLEAN NOT NULL DEFAULT false,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    state VARCHAR(2),
    city VARCHAR(255),
    ticket_type VARCHAR(100) NOT NULL,
    partner_name TEXT,
    selected_products JSONB,
    total DECIMAL(10,2) NOT NULL,
    terms_accepted BOOLEAN NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    installments INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for event form system
CREATE INDEX IF NOT EXISTS idx_event_form_configs_event_id ON event_form_configs (event_id);
CREATE INDEX IF NOT EXISTS idx_event_form_configs_is_active ON event_form_configs (is_active);
CREATE INDEX IF NOT EXISTS idx_event_form_configs_config_data ON event_form_configs USING GIN (config_data);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_cpf ON event_registrations (cpf);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations (email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_selected_products ON event_registrations USING GIN (selected_products);

-- Create unique constraint for active configuration (only one active per event)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_form_configs_unique_active
ON event_form_configs (event_id)
WHERE is_active = true;

-- Create composite unique constraint for duplicate prevention (CPF + event_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_unique_cpf_event
ON event_registrations (event_id, cpf)
WHERE cpf IS NOT NULL;

-- Create composite unique constraint for duplicate prevention (email + event_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_unique_email_event
ON event_registrations (event_id, email);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_event_form_configs_updated_at
    BEFORE UPDATE ON event_form_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample configuration data
INSERT INTO event_form_configs (event_id, is_active, config_data) VALUES (
    1,
    true,
    '{
        "foreignerOption": {
            "enabled": true
        },
        "ticketTypes": [
            {
                "name": "Individual",
                "price": 350.00,
                "requiresPartner": false
            },
            {
                "name": "Dupla",
                "price": 600.00,
                "requiresPartner": true
            }
        ],
        "products": [
            {
                "name": "Camiseta",
                "price": 85.00,
                "options": ["P", "M", "G", "GG"]
            },
            {
                "name": "Combo Alimentação",
                "price": 145.00,
                "options": ["Sim", "Não"]
            }
        ]
    }'::jsonb
) ON CONFLICT DO NOTHING;