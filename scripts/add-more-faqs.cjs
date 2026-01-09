require('dotenv').config();
const { Client } = require('pg');

// Nome do evento/site - configurável via variável de ambiente
const SITE_NAME = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const additionalFaqs = [
  {
    question: "Qual é o valor da inscrição?",
    answer: "<p>Os valores são atualizados constantemente e podem variar dependendo da época da inscrição. <strong>Há descontos especiais para inscrições em dupla!</strong></p><p>Para conferir os valores mais atuais, clique em \"QUERO PARTICIPAR\" e acesse a página oficial de inscrições.</p>",
    displayOrder: 6,
    isActive: true
  },
  {
    question: "O evento inclui hospedagem e alimentação?",
    answer: "<p>A <strong>hospedagem não está inclusa</strong> na inscrição. Uberlândia oferece diversas opções de hotéis e pousadas próximas ao evento.</p><p>Já a <strong>alimentação durante o evento</strong> geralmente está inclusa no valor da inscrição. Consulte os detalhes completos na página de inscrições.</p>",
    displayOrder: 7,
    isActive: true
  },
  {
    question: `Quantos dias dura o ${SITE_NAME}?`,
    answer: `<p>O ${SITE_NAME} é uma <strong>imersão completa de 3 dias</strong> (sexta a domingo) para respirar Zouk do início ao fim, com programação intensiva de aulas, workshops e baladas.</p><p>São mais de 300 horas de balada distribuídas ao longo desses dias!</p>`,
    displayOrder: 8,
    isActive: true
  },
  {
    question: "Como chegar em Uberlândia?",
    answer: "<p><strong>Principais formas de chegar:</strong></p><ul><li><strong>São Paulo:</strong> 50 minutos de voo ou 8 horas de ônibus</li><li><strong>Belo Horizonte:</strong> 50 minutos de voo ou 10 horas de ônibus</li><li><strong>Rio de Janeiro:</strong> 60 minutos de voo</li></ul><p>A cidade possui excelente infraestrutura e é classificada entre as que mais sediam eventos internacionais no Brasil.</p>",
    displayOrder: 9,
    isActive: true
  },
  {
    question: "Preciso ter experiência em Zouk para participar?",
    answer: `<p><strong>Não é necessário!</strong> O ${SITE_NAME} é conhecido por receber <strong>participantes de todos os níveis</strong>, desde iniciantes até avançados.</p><p>Temos aulas específicas para cada nível e o ambiente é totalmente acolhedor para quem está começando.</p>`,
    displayOrder: 10,
    isActive: true
  },
  {
    question: "O que está incluído na inscrição?",
    answer: "<p><strong>A inscrição geralmente inclui:</strong></p><ul><li>Acesso a todas as aulas e workshops</li><li>Participação nas baladas oficiais</li><li>Alimentação durante o evento</li><li>Material do congresso</li><li>Acesso às instalações do Recanto da Lua</li></ul><p><em>Consulte os detalhes específicos na página de inscrições para a edição atual.</em></p>",
    displayOrder: 11,
    isActive: true
  },
  {
    question: `Quando acontece o ${SITE_NAME}?`,
    answer: `<p>O ${SITE_NAME} 2026 está marcado para <strong>4–7 de Setembro de 2026</strong> em Uberlândia, MG.</p><p>O evento sempre acontece em <strong>setembro</strong> e é uma tradição anual que reúne zoukeiros de todo o Brasil e do mundo!</p>`,
    displayOrder: 12,
    isActive: true
  },
  {
    question: "Onde exatamente acontece o evento?",
    answer: `<p>O ${SITE_NAME} acontece no <strong>Recanto da Lua</strong>, uma chácara localizada no bairro Chácaras Panorama em Uberlândia-MG.</p><p>É um ambiente único: uma chácara dentro da cidade, oferecendo toda a infraestrutura necessária para o evento em um cenário natural e acolhedor.</p>`,
    displayOrder: 13,
    isActive: true
  },
  {
    question: "Posso cancelar minha inscrição?",
    answer: "<p>As <strong>políticas de cancelamento</strong> podem variar de acordo com a época da solicitação e outros fatores.</p><p>Para informações detalhadas sobre cancelamentos e reembolsos, consulte os termos na página de inscrições ou entre em contato através do WhatsApp oficial do evento.</p>",
    displayOrder: 14,
    isActive: true
  },
  {
    question: "Há desconto para grupos?",
    answer: "<p><strong>Sim!</strong> Existe desconto especial quando você se inscreve em <strong>dupla</strong> com um(a) amigo(a).</p><p>Ambos precisam se inscrever normalmente, mas ambos recebem desconto no valor final.</p><p>Consulte os valores atualizados na página de inscrições!</p>",
    displayOrder: 15,
    isActive: true
  }
];

async function addFaqs() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();

    console.log('🔄 Adicionando FAQs adicionais...');

    for (const faq of additionalFaqs) {
      const result = await client.query(`
        INSERT INTO faqs (question, answer, display_order, is_active)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [faq.question, faq.answer, faq.displayOrder, faq.isActive]);

      if (result.rows.length > 0) {
        console.log(`✅ FAQ adicionada: "${faq.question}" (ID: ${result.rows[0].id})`);
      } else {
        console.log(`⚠️  FAQ já existe: "${faq.question}"`);
      }
    }

    console.log('🎉 Processo concluído!');
    console.log(`📊 Total de ${additionalFaqs.length} FAQs processadas.`);

    // Mostrar estatísticas finais
    const totalFaqs = await client.query('SELECT COUNT(*) as count FROM faqs WHERE is_active = true');
    console.log(`📝 Total de FAQs ativas no banco: ${totalFaqs.rows[0].count}`);

  } catch (err) {
    console.error('❌ Erro ao adicionar FAQs:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addFaqs();