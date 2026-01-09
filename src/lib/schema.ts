import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, decimal, date } from 'drizzle-orm/pg-core';

// Event Configuration Table
export const eventConfig = pgTable('event_config', {
  id: serial('id').primaryKey(),
  eventTitle: varchar('event_title', { length: 255 }).notNull().default('Meu Evento 2025'),
  eventSubtitle: varchar('event_subtitle', { length: 500 }).notNull().default('Uma experiência única'),
  eventTagline: varchar('event_tagline', { length: 255 }).notNull().default('Seu evento especial'),
  eventDateDisplay: varchar('event_date_display', { length: 100 }).notNull().default('Data a definir'),
  eventCountdownTarget: timestamp('event_countdown_target').notNull().default('2025-09-05 14:00:00-03'),
  eventCountdownText: varchar('event_countdown_text', { length: 255 }).notNull().default('O evento inicia em:'),
  heroVideoUrl: text('hero_video_url').default(''),
  registrationUrl: text('registration_url').notNull().default('/inscricoes'),
  s3Endpoint: text('s3_endpoint').default(''),
  s3AccessKey: text('s3_access_key').default(''),
  s3SecretKey: text('s3_secret_key').default(''),
  s3BucketName: text('s3_bucket_name').default(''),
  s3Region: text('s3_region').default('auto'),
  s3PublicDomain: text('s3_public_domain').default(''),
  s3Enabled: boolean('s3_enabled').default(false),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).default(''),
  whatsappMessage: text('whatsapp_message').default('Oi! Quero mais informações sobre o evento'),
  whatsappEnabled: boolean('whatsapp_enabled').default(true),
  temporaryRedirectUrl: text('temporary_redirect_url').default(null),
  metaTitle: varchar('meta_title', { length: 255 }).default(null),
  metaDescription: text('meta_description').default(null),
  metaImageUrl: text('meta_image_url').default(null),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Hero Section Content
export const heroContent = pgTable('hero_content', {
  id: serial('id').primaryKey(),
  ctaPrimaryText: varchar('cta_primary_text', { length: 100 }).notNull().default('QUERO SABER MAIS'),
  ctaSecondaryText: varchar('cta_secondary_text', { length: 100 }).notNull().default('PULAR PARA INGRESSOS'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// About Section Content
export const aboutContent = pgTable('about_content', {
  id: serial('id').primaryKey(),
  sectionTitle: varchar('section_title', { length: 255 }).notNull().default('Sobre o Evento'),
  paragraph1: text('paragraph_1').notNull().default('Uma experiência única com conteúdo selecionado e profissionais de qualidade.'),
  paragraph2: text('paragraph_2').notNull().default('Contamos com participantes de todos os níveis das mais diversas cidades.'),
  paragraph3: text('paragraph_3').notNull().default('A junção perfeita entre aprendizado e socialização.'),
  trailerVideoUrl: text('trailer_video_url').default('https://www.youtube.com/embed/5Q7hGUc3fMY?autoplay=1&mute=1'),
  trailerButtonText: varchar('trailer_button_text', { length: 100 }).notNull().default('Veja um breve trailer'),
  beginnerTitle: varchar('beginner_title', { length: 255 }).notNull().default('Se você é iniciante...'),
  beginnerText: text('beginner_text').notNull().default('prepare-se para aulas que vão desenvolver sua base, mas também a experiência real de uma balada de Zouk com pessoas que praticam em lugares totalmente diferentes.'),
  advancedTitle: varchar('advanced_title', { length: 255 }).notNull().default('Se você é intermediário ou avançado...'),
  advancedText: text('advanced_text').notNull().default('prepare-se para aprofundar as técnicas e aprender com professores que rodam o mundo levando o Zouk.'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Statistics Content
export const statsContent = pgTable('stats_content', {
  id: serial('id').primaryKey(),
  sectionTitle: varchar('section_title', { length: 255 }).notNull().default('Nossos números'),
  participantsCount: integer('participants_count').notNull().default(3190),
  participantsLabel: varchar('participants_label', { length: 100 }).notNull().default('Participantes'),
  teachersCount: integer('teachers_count').notNull().default(56),
  teachersLabel: varchar('teachers_label', { length: 100 }).notNull().default('Professores'),
  djsCount: integer('djs_count').notNull().default(25),
  djsLabel: varchar('djs_label', { length: 100 }).notNull().default('DJs'),
  partyHoursCount: integer('party_hours_count').notNull().default(300),
  partyHoursLabel: varchar('party_hours_label', { length: 100 }).notNull().default('Horas de balada'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Artists Table
export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  cityState: varchar('city_state', { length: 100 }).notNull(),
  photoUrl: text('photo_url'),
  description: text('description'),
  promotionalVideoUrl: text('promotional_video_url'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Artists Section Content
export const artistsContent = pgTable('artists_content', {
  id: serial('id').primaryKey(),
  sectionTitle: varchar('section_title', { length: 255 }).notNull().default('Artistas Confirmados'),
  sectionSubtitle: text('section_subtitle').notNull().default('Professores e DJs renomados que farão parte desta experiência única'),
  ctaButtonText: varchar('cta_button_text', { length: 100 }).notNull().default('QUERO PARTICIPAR'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Testimonials Table
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  cityState: varchar('city_state', { length: 255 }).notNull(),
  testimonialText: text('testimonial_text').notNull(),
  photoUrl: text('photo_url'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Testimonials Section Content
export const testimonialsContent = pgTable('testimonials_content', {
  id: serial('id').primaryKey(),
  sectionTitle: varchar('section_title', { length: 255 }).notNull().default('Depoimentos'),
  sectionSubtitle: text('section_subtitle').notNull().default('O que nossos participantes dizem sobre a experiência'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Location Content
export const locationContent = pgTable('location_content', {
  id: serial('id').primaryKey(),
  sectionTitle: varchar('section_title', { length: 255 }).notNull().default('Uberlândia, MG'),
  sectionSubtitle: text('section_subtitle').notNull().default('O evento oficial acontece sempre em Uberlândia (Minas Gerais)'),
  descriptionParagraph1: text('description_paragraph_1').notNull().default('Recentemente a cidade foi classificada pela International Congress and Convention Association (ICCA) (a principal entidade do segmento de turismo e eventos internacionais) como uma das cidades brasileiras que mais sedia eventos internacionais, ficando na nona posição.'),
  descriptionParagraph2: text('description_paragraph_2').notNull().default('Entre as doze cidades melhores colocadas, Uberlândia é a única que não é capital.'),
  travelInfoTitle: varchar('travel_info_title', { length: 255 }).notNull().default('Como chegar em Uberlândia:'),
  travelInfoSp: varchar('travel_info_sp', { length: 255 }).notNull().default('50 minutos de São Paulo (voo) / 8 horas de ônibus'),
  travelInfoBh: varchar('travel_info_bh', { length: 255 }).notNull().default('50 minutos de Belo Horizonte (voo) / 10 horas de ônibus'),
  travelInfoRj: varchar('travel_info_rj', { length: 255 }).notNull().default('60 minutos do Rio de Janeiro (voo)'),
  venueTitle: varchar('venue_title', { length: 255 }).notNull().default('O local do evento'),
  venueDescription: text('venue_description').notNull().default('Local a ser definido.'),
  venueVideoUrl: text('venue_video_url').default('https://www.youtube.com/embed/sDHDoiNoMjU?autoplay=1'),
  hotelBookingUrl: text('hotel_booking_url').notNull().default('https://www.booking.com/searchresults.pt-br.html?ss=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&ssne=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&ssne_untouched=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&highlighted_hotels=776746&efdco=1&label=New_Portuguese_PT_ROW_6409090206-_9oPl604g33uUPimd0_L7QS60966725406%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=175071b8c7e991c1b3e84c4dc897231e&aid=360920&lang=pt-br&sb=1&src=searchresults&latitude=-18.9664786&longitude=-48.349411&checkin=2024-09-05&checkout=2024-09-09&group_adults=2&no_rooms=1&group_children=0'),
  hotelButtonText: varchar('hotel_button_text', { length: 100 }).notNull().default('Lista de hotéis'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Participation Content
export const participationContent = pgTable('participation_content', {
  id: serial('id').primaryKey(),
  sectionTitle: varchar('section_title', { length: 255 }).notNull().default('Como Participar'),
  mainTitle: varchar('main_title', { length: 255 }).notNull().default('Você NÃO PRECISA de um par para se inscrever'),
  paragraph1: text('paragraph_1').notNull().default('Você pode se inscrever individualmente, e acredite, você será muito bem recebido(a) por todos os participantes, acolhido(a) como o Luís foi (entenda aqui).'),
  paragraph2: text('paragraph_2').notNull().default('Agora, se você formar um par, com amigo(a), aí você terá um desconto.'),
  paragraph3: text('paragraph_3').notNull().default('Ambos precisarão se inscrever normalmente, mas ambos terão desconto.'),
  paragraph4: text('paragraph_4').notNull().default('Os valores atualizados ficam na página de inscrição, confira abaixo'),
  ctaButtonText: varchar('cta_button_text', { length: 100 }).notNull().default('QUERO PARTICIPAR'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Footer Content
export const footerContent = pgTable('footer_content', {
  id: serial('id').primaryKey(),
  eventTitle: varchar('event_title', { length: 255 }).notNull().default('Meu Evento 2025'),
  eventDescription: text('event_description').notNull().default('Uma experiência única'),
  eventDates: varchar('event_dates', { length: 100 }).notNull().default('Data a definir'),
  eventLocation: varchar('event_location', { length: 255 }).notNull().default('Local a definir'),
  venueName: varchar('venue_name', { length: 255 }).notNull().default(''),
  venueArea: varchar('venue_area', { length: 255 }).notNull().default(''),
  copyrightText: varchar('copyright_text', { length: 255 }).notNull().default('© 2025. Todos os direitos reservados.'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Redirects Table
export const redirects = pgTable('redirects', {
  id: serial('id').primaryKey(),
  alias: varchar('alias', { length: 255 }).notNull().unique(),
  targetUrl: text('target_url').notNull(),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Simone Sprint Management Tables
export const sprints = pgTable('sprints', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('planning'), // planning, active, completed, archived
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  targetCompletionDate: timestamp('target_completion_date'),
  progress: integer('progress').default(0), // 0-100 percentage
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // low, medium, high, critical
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sprintTasks = pgTable('sprint_tasks', {
  id: serial('id').primaryKey(),
  sprintId: integer('sprint_id').notNull().references(() => sprints.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed, blocked, cancelled
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  assignedTo: varchar('assigned_to', { length: 255 }),
  tags: text('tags'), // JSON array of tags
  dependencies: text('dependencies'), // JSON array of task IDs
  completedAt: timestamp('completed_at'),
  blockedReason: text('blocked_reason'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sprintExecutions = pgTable('sprint_executions', {
  id: serial('id').primaryKey(),
  sprintId: integer('sprint_id').notNull().references(() => sprints.id, { onDelete: 'cascade' }),
  executionType: varchar('execution_type', { length: 50 }).notNull(), // manual, automated, scheduled
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, running, completed, failed
  results: text('results'), // JSON execution results
  logs: text('logs'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ===== EVENT FORM CONFIGURATION SYSTEM =====

// Event Form Configurations Table
export const eventFormConfigs = pgTable('event_form_configs', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => eventConfig.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(false),
  configData: jsonb('config_data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Event Registrations Table
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => eventConfig.id, { onDelete: 'cascade' }),
  cpf: varchar('cpf', { length: 14 }),
  isForeigner: boolean('is_foreigner').notNull().default(false),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 20 }).notNull(),
  birthDate: date('birth_date').notNull(),
  state: varchar('state', { length: 2 }),
  city: varchar('city', { length: 255 }),
  ticketType: varchar('ticket_type', { length: 100 }).notNull(),
  partnerName: text('partner_name'),
  selectedProducts: jsonb('selected_products'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  termsAccepted: boolean('terms_accepted').notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(),
  installments: integer('installments').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});