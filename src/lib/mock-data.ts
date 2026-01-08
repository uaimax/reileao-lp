// Mock data for development until we have a proper backend API

export const mockEventConfig = {
  id: 1,
  eventTitle: 'UAIZOUK 2025',
  eventSubtitle: 'UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO',
  eventTagline: 'Muita aula. Muita dança. Muito Zouk.',
  eventDateDisplay: '5–7 SET 2025, Uberlândia–MG',
  eventCountdownTarget: '2025-09-05T17:00:00.000Z',
  eventCountdownText: 'A experiência completa inicia em:',
  heroVideoUrl: 'https://www.youtube.com/embed/U2QPiVaMAVc?autoplay=1&mute=1&loop=1&playlist=U2QPiVaMAVc&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=0',
  registrationUrl: 'https://uaizouk.com.br/inscricoes',
  whatsappNumber: '5534988364084',
  whatsappMessage: 'Oi! Quero mais informações sobre o UAIZOUK',
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
  sectionTitle: 'Entenda o UAIZOUK',
  paragraph1: 'Serão 3 dias de imersão presencial para respirar Zouk do início ao fim, com conteúdo selecionado e diversidade de professores e djs que conduzem toda a programação.',
  paragraph2: 'Ao longo de todos esses anos de UAIZOUK nós contamos com participantes de todos os níveis das mais diversas cidades do Brasil e do mundo.',
  paragraph3: 'O Congresso UAIZOUK é a junção perfeita entre aprendizado para todos os níveis em um ambiente de socialização completo.',
  trailerVideoUrl: 'https://www.youtube.com/embed/5Q7hGUc3fMY?autoplay=1&mute=1',
  trailerButtonText: 'Veja um breve trailer',
  beginnerTitle: 'Se você é iniciante...',
  beginnerText: 'prepare-se para aulas que vão desenvolver sua base, mas também a experiência real de uma balada de Zouk com pessoas que praticam em lugares totalmente diferentes.',
  advancedTitle: 'Se você é intermediário ou avançado...',
  advancedText: 'prepare-se para aprofundar as técnicas e aprender com professores que rodam o mundo levando o Zouk.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockStatsContent = {
  id: 1,
  sectionTitle: 'Já passaram pelo UAIZOUK mais de',
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
    name: 'Trícia',
    cityState: 'Belém (PA)',
    testimonialText: 'Esta foi minha 2° vez no UaiZouk e posso dizer com toda certeza que não existe congresso melhor. A conexão que existe entre as pessoas, o carinho, acolhimento e cuidado da equipe (maravilhosa!), os bailes incríveis (sério, os melhores bailes de zouk de todos!). Sou APAIXONADA por este evento. Quem gosta de zouk ou quer conhecer o ritmo PRECISA viver o UZ!',
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
    testimonialText: 'Vou ao UAIZOUK desde que descobri sua existência em 2017 e tenho um enorme carinho por ele visto que, por meio dele, pude ter a percepção de que há n caminhos na dança, dentre os quais podemos priorizar elementos como conexão, respiração e cuidado.',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockTestimonialsContent = {
  id: 1,
  sectionTitle: 'Depoimentos',
  sectionSubtitle: 'O que nossos participantes dizem sobre a experiência UAIZOUK',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockLocationContent = {
  id: 1,
  sectionTitle: 'Uberlândia, MG',
  sectionSubtitle: 'O evento oficial acontece sempre em Uberlândia (Minas Gerais)',
  descriptionParagraph1: 'Recentemente a cidade foi classificada pela International Congress and Convention Association (ICCA) (a principal entidade do segmento de turismo e eventos internacionais) como uma das cidades brasileiras que mais sedia eventos internacionais, ficando na nona posição.',
  descriptionParagraph2: 'Entre as doze cidades melhores colocadas, Uberlândia é a única que não é capital.',
  travelInfoTitle: 'Como chegar em Uberlândia:',
  travelInfoSp: '50 minutos de São Paulo (voo) / 8 horas de ônibus',
  travelInfoBh: '50 minutos de Belo Horizonte (voo) / 10 horas de ônibus',
  travelInfoRj: '60 minutos do Rio de Janeiro (voo)',
  venueTitle: 'O local do UAIZOUK 2025',
  venueDescription: 'O UAIZOUK acontece no Recanto da Lua, uma chácara dentro da cidade no bairro Chácaras Panorama.',
  venueVideoUrl: 'https://www.youtube.com/embed/sDHDoiNoMjU?autoplay=1',
  hotelBookingUrl: 'https://www.booking.com/searchresults.pt-br.html?ss=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&ssne=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&ssne_untouched=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil&highlighted_hotels=776746&efdco=1&label=New_Portuguese_PT_ROW_6409090206-_9oPl604g33uUPimd0_L7QS60966725406%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=175071b8c7e991c1b3e84c4dc897231e&aid=360920&lang=pt-br&sb=1&src=searchresults&latitude=-18.9664786&longitude=-48.349411&checkin=2024-09-05&checkout=2024-09-09&group_adults=2&no_rooms=1&group_children=0',
  hotelButtonText: 'Lista de hotéis',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockParticipationContent = {
  id: 1,
  sectionTitle: 'Como Participar',
  mainTitle: 'Você NÃO PRECISA de um par para se inscrever no UAIZOUK',
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
  eventTitle: 'UAIZOUK 2025',
  eventDescription: 'Uma imersão completa nas possibilidades do Zouk Brasileiro',
  eventDates: '05 a 07 de Setembro',
  eventLocation: 'Uberlândia, MG',
  venueName: 'Recanto da Lua',
  venueArea: 'Chácaras Panorama',
  copyrightText: '© 2025 UAIZOUK. Todos os direitos reservados.',
  createdAt: new Date(),
  updatedAt: new Date(),
};