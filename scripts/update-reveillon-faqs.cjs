require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Datas do evento baseadas no DATA.json
const EVENT_DATES = {
  checkIn: {
    date: '31/12 de 2025',
    time: '14:59'
  },
  checkOut: {
    date: '4 de janeiro de 2026',
    time: '8:59'
  }
};

const newFaqs = [
  {
    question: "Quando devo chegar?",
    answer: `Você poderá fazer o check-in a partir do dia ${EVENT_DATES.checkIn.date} às ${EVENT_DATES.checkIn.time}.`,
    displayOrder: 1,
    isActive: true
  },
  {
    question: "Como chegar?",
    answer: "Uberlândia é uma cidade de fácil acesso, com aeroporto próprio que fica há 50 minutos de São Paulo. Ainda saindo de São Paulo é um trajeto bem tranquilo de carro através da BR 050, ou confortavelmente de ônibus pela Buser.com.br, Levare.com.br entre outras. Chegando em Uberlândia, o acesso até a chácara é possível através de Uber, ficando apenas a aproximadamente 30 minutos do centro da cidade.",
    displayOrder: 2,
    isActive: true
  },
  {
    question: "A hospedagem é inclusa? Posso me hospedar fora?",
    answer: "A hospedagem é inclusa e pedimos para que ninguém se hospede fora, o Rei Leão se propõe a ser um evento imersivo onde viveremos por esses dias como uma comunidade.",
    displayOrder: 3,
    isActive: true
  },
  {
    question: "A alimentação é inclusa?",
    answer: "Sim. As refeições inclusas são: Café da manhã, almoço, jantar e ceia de ano novo. Como as refeições possuem horários específicos, a gente recomenda que você leve uma fruta, ou snacks caso dê vontade de comer algo de madrugada ou em algum dos intervalos. O cardápio é disponibilizado dia após dia durante o evento e seguindo o tema de \"comida mineira\" caseira, também favorecendo saladas e com opção ovolactovegetariana, porém, se sua alimentação for mais específica pedimos que ao chegar se comunique diretamente com a Fabiana (do buffet) para que ela possa alinhar da melhor forma com você.",
    displayOrder: 4,
    isActive: true
  },
  {
    question: "Qual a programação?",
    answer: "Temos atividades guiadas diariamente por Luan e Adriana e ao mesmo tempo diversas interações que acontecem naturalmente e são idealizadas pelos próprios participantes como rodas de violão (e outros instrumentos), brigas de galo na piscina, futebol, peteca, vôlei, acroyoga, jogos de tabuleiro, jogo sobre Comunicação Não violenta, e até workshop de circo nós já tivemos. Espere muita dança (de todo tipo!), e muitas surpresas ao somar participantes ultra criativos e um espaço de quase 4000m² de muita natureza.",
    displayOrder: 5,
    isActive: true
  },
  {
    question: "É para quem dança?",
    answer: "Não. O Reveillon realmente une todas as tribos. Ao mesmo tempo que acontecem as atividades principais que normalmente são de meditação ativa, dança ou entretenimento, também acontecem as atividades paralelas que acontecem naturalmente podendo ser uma rodinha de violão, um bate-papo na piscina, um jogo de tabuleiro, peteca, volei, etc. Já tivemos até mesmo uma aulinha de lira circense com a Mari Martins, totalmente natural e sem se prender a uma programação fixa.",
    displayOrder: 6,
    isActive: true
  },
  {
    question: "Quais ritmos que toca?",
    answer: "O reveillon une todas as tribos, então mesmo que o Zouk seja predominante, não se assuste se de repente começar um Axé, um Forró, um Samba, ou qualquer outro ritmo. A DJ Ju Sanper com Dj Zé do Lago que comandam os momentos de baile e se orienta pela pista, livre, sem regras.",
    displayOrder: 7,
    isActive: true
  },
  {
    question: "Quem coloca música?",
    answer: "Nossa DJ residente é a maravilhosa Ju Sanper que comanda o baile a noite juntamente com o TOP Dj Zé do Lago, mas durante o dia o som tá a nossa disposição pra dançar o que quisermos.",
    displayOrder: 8,
    isActive: true
  },
  {
    question: "Vi que tem um ingresso \"dupla\", como funciona?",
    answer: "O ingresso dupla não se refere a um quarto duplo (ainda se refere aos alojamentos compartilhados), porém se trata de um desconto ao comprar com mais uma pessoa. A única diferença entre as duas inscrições (dupla e individual) é de fato o desconto.",
    displayOrder: 9,
    isActive: true
  },
  {
    question: "Possuo restrição alimentar, como faço?",
    answer: "Pedimos que ao chegar você fale no nosso primeiro bate-papo, desse modo te direcionaremos para a Fabiana que é a nossa chef, e ela poderá alinhar com você uma melhor forma.",
    displayOrder: 10,
    isActive: true
  },
  {
    question: "Sobre as instalações, acomodações no geral",
    answer: "As acomodações/dependências são simples, de chácara mesmo. Recomendamos que tragam sua própria roupa de cama para maior conforto. Todos os quartos são suítes com banheiro.",
    displayOrder: 11,
    isActive: true
  },
  {
    question: "Quando é check-out?",
    answer: `Nosso check-out será no dia ${EVENT_DATES.checkOut.date} até às ${EVENT_DATES.checkOut.time} da manhã.`,
    displayOrder: 12,
    isActive: true
  }
];

async function updateFaqs() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();

    console.log('🗑️  Removendo FAQs antigas...');
    await client.query('DELETE FROM faqs');
    console.log('✅ FAQs antigas removidas');

    console.log('📝 Inserindo novas FAQs do Réveillon...');

    for (const faq of newFaqs) {
      const result = await client.query(`
        INSERT INTO faqs (question, answer, display_order, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [faq.question, faq.answer, faq.displayOrder, faq.isActive]);

      console.log(`✅ FAQ ${faq.displayOrder}: "${faq.question.substring(0, 50)}..." (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 Processo concluído!');
    console.log(`📊 Total de ${newFaqs.length} FAQs inseridas.`);

    // Mostrar estatísticas finais
    const totalFaqs = await client.query('SELECT COUNT(*) as count FROM faqs WHERE is_active = true');
    console.log(`📝 Total de FAQs ativas no banco: ${totalFaqs.rows[0].count}`);

    // Mostrar as datas usadas
    console.log('\n📅 Datas do evento configuradas:');
    console.log(`   Check-in: ${EVENT_DATES.checkIn.date} às ${EVENT_DATES.checkIn.time}`);
    console.log(`   Check-out: ${EVENT_DATES.checkOut.date} às ${EVENT_DATES.checkOut.time}`);

  } catch (err) {
    console.error('❌ Erro ao atualizar FAQs:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateFaqs();

