// Mock data for development until we have a proper backend API
import { SITE_NAME, getSiteNameWithYear, getWhatsAppMessage, getSectionTitle, getCopyrightText, getRegistrationUrl } from './site-config';

export const mockEventConfig = {
  id: 1,
  eventTitle: getSiteNameWithYear('2025'),
  eventSubtitle: 'Uma experiência única',
  eventTagline: 'Seu evento especial',
  eventDateDisplay: 'Data a definir',
  eventCountdownTarget: '2025-12-31T14:59:00',
  eventCountdownText: 'O evento inicia em:',
  heroVideoUrl: null,
  registrationUrl: getRegistrationUrl(),
  whatsappNumber: '',
  whatsappMessage: getWhatsAppMessage(),
  whatsappEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockHeroContent = {
  id: 1,
  ctaPrimaryText: 'QUERO SABER MAIS',
  ctaSecondaryText: 'PULAR PARA INGRESSOS',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAboutContent = {
  id: 1,
  sectionTitle: 'Por que esse Réveillon',
  paragraph1: 'O Reveillon em Uberlândia não é um congresso ou festival.',
  paragraph2: 'As atividades propostas são pensadas no intuito de criar um espaço seguro para todos poderem "ser" em indivíduo e comunidade durante esses dias.',
  paragraph3: 'Uma das intenções é fechar o ciclo do ano que está se encerrando e iniciar o próximo com boas energias.',
  trailerVideoUrl: null,
  trailerButtonText: null,
  beginnerTitle: null,
  beginnerText: null,
  advancedTitle: null,
  advancedText: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockStatsContent = {
  id: 1,
  sectionTitle: `Já passaram pelo ${SITE_NAME} mais de`,
  participantsCount: 3190,
  participantsLabel: 'Participantes',
  teachersCount: 56,
  teachersLabel: 'Professores',
  djsCount: 25,
  djsLabel: 'DJs',
  partyHoursCount: 300,
  partyHoursLabel: 'Horas de balada',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockArtists = [
  {
    id: 1,
    name: 'Luan e Adriana',
    role: 'Professores Confirmados',
    cityState: 'SP',
    photoUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400',
    description: 'Professores renomados de Zouk',
    promotionalVideoUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Zen Eyer',
    role: 'DJ',
    cityState: 'RJ',
    photoUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&h=400',
    description: 'DJ especializado em Zouk',
    promotionalVideoUrl: null,
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'DJ Ju Sanper',
    role: 'DJ e MC',
    cityState: 'SP',
    photoUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=400&h=400',
    description: 'DJ e MC',
    promotionalVideoUrl: null,
    displayOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: 'DJ Zé do Lago',
    role: 'DJ',
    cityState: 'SP',
    photoUrl: 'https://images.unsplash.com/photo-1501286353178-1ec881214838?auto=format&fit=crop&w=400&h=400',
    description: 'DJ',
    promotionalVideoUrl: null,
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockArtistsContent = {
  id: 1,
  sectionTitle: 'Artistas Confirmados',
  sectionSubtitle: 'Professores e DJs renomados que farão parte desta experiência única',
  ctaButtonText: 'QUERO PARTICIPAR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTestimonials = [
  {
    id: 1,
    name: 'Participante',
    cityState: 'Brasil',
    testimonialText: `Esta foi minha experiência no ${SITE_NAME} e posso dizer com toda certeza que foi incrível. A conexão que existe entre as pessoas, o carinho, acolhimento e cuidado da equipe. Sou apaixonado(a) por este evento!`,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Andressa',
    cityState: 'Uberlândia (MG)',
    testimonialText: 'É simplesmente o congresso que me deixa noites sem dormir de ansiedade quando está chegando e quase chorando quando acaba! Imersão maravilhosa com profissionais incríveis e congressistas de todas as partes do Brasil!!! Só venham!!!!',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Fred',
    cityState: 'Ribeirão Preto (SP)',
    testimonialText: 'Mais um ano que revejo amigos queridos e volto pra casa com minha bateria totalmente carregada',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: 'Paulo Pinto',
    cityState: 'Campinas (SP)',
    testimonialText: `Vou ao ${SITE_NAME} desde que descobri sua existência em 2017 e tenho um enorme carinho por ele visto que, por meio dele, pude ter a percepção de que há n caminhos na dança, dentre os quais podemos priorizar elementos como conexão, respiração e cuidado.`,
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockTestimonialsContent = {
  id: 1,
  sectionTitle: 'Depoimentos',
  sectionSubtitle: `O que nossos participantes dizem sobre a experiência ${SITE_NAME}`,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockLocationContent = {
  id: 1,
  sectionTitle: 'Como chegar',
  sectionSubtitle: null,
  descriptionParagraph1: null,
  descriptionParagraph2: null,
  travelInfoTitle: null,
  travelInfoSp: null,
  travelInfoBh: null,
  travelInfoRj: null,
  venueTitle: 'Espaço Atrium Eventos',
  venueDescription: 'Espaço Atrium Eventos - Uberlândia, MG',
  venueVideoUrl: null,
  hotelBookingUrl: null,
  hotelButtonText: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockParticipationContent = {
  id: 1,
  sectionTitle: 'Como Participar',
  mainTitle: `Você NÃO PRECISA de um par para se inscrever no ${SITE_NAME}`,
  paragraph1: 'Você pode se inscrever individualmente, e acredite, você será muito bem recebido(a) por todos os participantes, acolhido(a) como o Luís foi (entenda aqui).',
  paragraph2: 'Agora, se você formar um par, com amigo(a), aí você terá um desconto.',
  paragraph3: 'Ambos precisarão se inscrever normalmente, mas ambos terão desconto.',
  paragraph4: 'Os valores atualizados ficam na página de inscrição, confira abaixo',
  ctaButtonText: 'QUERO PARTICIPAR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockFooterContent = {
  id: 1,
  eventTitle: 'Réveillon em Uberlândia',
  eventDescription: null,
  eventDates: null,
  eventLocation: null,
  venueName: null,
  venueArea: null,
  copyrightText: 'Copyright © 2024-2025 Rei Leão Eventos. Todos os direitos reservados.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockFAQs = [
  {
    id: 1,
    question: 'Preciso levar um par para participar?',
    answer: 'Não! Você pode se inscrever individualmente. O evento é aberto a todos, e você será muito bem recebido(a) por todos os participantes.',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    question: 'O que está incluído no valor?',
    answer: 'Café da manhã, almoço, jantar e ceia de Ano-Novo estão incluídos. Além disso, você terá acesso a todas as atividades, piscina, quartos suítes coletivos e muito mais!',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    question: 'Como chegar no local?',
    answer: 'Uberlândia possui aeroporto próprio (50 min de São Paulo). Você pode vir de carro pela BR-050, de ônibus (Buser, Levare etc.) ou usar Uber/taxi até a chácara (~30 min do centro).',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    question: 'O que devo levar?',
    answer: 'Roupas confortáveis para dançar, roupas de banho para a piscina, protetor solar, repelente e muita disposição para aproveitar!',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    question: 'Há sinal de internet no local?',
    answer: 'O 4G ou 5G de algumas operadoras pegam normalmente no local. Algumas pessoas já fizeram calls de lá sem problemas, então é possível fazer home-office se necessário.',
    displayOrder: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    question: 'Qual a programação do evento?',
    answer: 'A programação completa estará disponível em breve no nosso Instagram @reileaouberlandia. O Reveillon é pensado para ser um espaço de liberdade, então espere atividades guiadas por Luan e Adriana, mas também momentos para você apenas SER.',
    displayOrder: 6,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockFAQSection = {
  id: 1,
  sectionTitle: 'Perguntas Frequentes',
  sectionSubtitle: 'Tire suas dúvidas sobre o Réveillon em Uberlândia',
  createdAt: new Date(),
  updatedAt: new Date(),
};