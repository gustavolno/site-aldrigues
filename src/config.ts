// Dados de contato num lugar só. Fonte: Anuário 2024/2025 do escritório (página "Maiores informações"), que traz a sede
// em Taguatinga, a filial em Vila Velha (ES), dois celulares e o e-mail jurídico. Confirmar qual celular atende o WhatsApp.
export const WHATSAPP = '5561993019232'; // (61) 99301-9232; o anuário também traz (61) 99616-9232
export const TELEFONE = { texto: '(61) 3352-5782', link: 'tel:+556133525782' };
export const EMAIL = 'juridico@aldriguescandido.adv.br';
export const INSTAGRAM = 'https://www.instagram.com/advocaciaaldriguescandido/'; // link que estava no site antigo
export const HORARIO = 'Segunda a sexta, das 9h às 18h';
export const CNPJ = '08.004.024/0001-20';

export const ESCRITORIOS = [
  { nome: 'Sede — Brasília (DF)', endereco: 'QSD 11, lote 39, Taguatinga Sul, Brasília – DF, 72020-110', telefones: ['(61) 3352-5782', '(61) 99616-9232', '(61) 99301-9232'] },
  // telefones do ES: os do site antigo (o anuário não traz telefone da filial)
  { nome: 'Filial — Vila Velha (ES)', endereco: 'Av. Dr. Olivio Lyra, 353, sala 1701, Centro Empresarial Shopping Praia da Costa, Praia da Costa, Vila Velha – ES', telefones: ['(27) 3320-6282', '(27) 3320-6260'] },
];

/** Link do WhatsApp já com a mensagem: a equipe sabe de que página a pessoa veio (útil para medir o Google Ads). */
export const zap = (assunto = '') =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Vim pelo site${assunto ? ` e quero falar sobre ${assunto}` : ''}.`)}`;

export const MENU = [
  ['/aposentadoria/', 'Aposentadoria'], ['/trabalhista/', 'Trabalhista'], ['/areas-de-atuacao/', 'Áreas de atuação'],
  ['/noticias/', 'Notícias'], ['/escritorio-aldrigues-candido/', 'O escritório'], ['/contato/', 'Contato'],
];

// O que a pessoa procura: o primeiro passo da página inicial
export const PEDIDOS = [
  { texto: 'Quero me aposentar', dica: 'Regras, tempo de contribuição e pedido no INSS', href: '/aposentadoria/', icone: 'ampulheta' },
  { texto: 'Quero revisar minha aposentadoria', dica: 'Conferir se o benefício foi calculado certo', href: '/revisao-da-aposentadoria/', icone: 'lupa' },
  { texto: 'Tenho uma questão trabalhista', dica: 'Direitos do trabalhador, demissão e acordos', href: '/trabalhista/', icone: 'pasta' },
  { texto: 'É outro assunto', dica: 'Veja todas as áreas em que atuamos', href: '/areas-de-atuacao/', icone: 'bussola' },
];

export const GRUPOS = [
  { titulo: 'Previdência e aposentadoria', icone: 'escudo', slugs: ['direito-previdenciario', 'aposentadoria', 'revisao-da-aposentadoria', 'planejamento-previdenciario', 'simular-aposentadoria', 'reforma-previdenciaria'] },
  { titulo: 'Trabalho', icone: 'pasta', slugs: ['trabalhista', 'direito-do-trabalho-individual-e-coletivo', 'meus-direitos-trabalhistas', 'negociacao-coletiva', 'direito-sindical', 'processo-do-trabalho'] },
  // os demais grupos seguem a ordem do Anuário 2024/2025
  { titulo: 'Constitucional, tribunais e setor público', icone: 'coluna', slugs: ['direito-constitucional', 'tribunais-superiores', 'atuacao-perante-o-congresso-nacional', 'atuacao-perante-o-tribunal-de-contas',
    'direito-administrativo', 'licitacoes-e-contratos', 'processo-administrativo-disciplinar', 'terceiro-setor', 'direito-regulatorio', 'concursos-publicos', 'direito-militar', 'direito-eleitoral'] },
  { titulo: 'Cível, família e imóveis', icone: 'escudo', slugs: ['direito-civil', 'direitos-reais', 'direito-de-familia-e-sucessoes', 'direito-contratual', 'processo-civil', 'direito-imobiliario', 'leilao',
    'direito-condominial', 'direito-do-consumidor', 'direito-bancario', 'direito-a-saude', 'planos-de-saude', 'direito-medico', 'direito-educacional', 'mediacao-e-arbitragem', 'advocacia-extrajudicial'] },
  { titulo: 'Empresas e tributos', icone: 'pasta', slugs: ['direito-societario-e-empresarial', 'direito-comercial', 'direito-tributario', 'tributario', 'planejamento-tributario', 'recuperacao-de-credito', 'execucao',
    'holding', 'compliance', 'direito-economico', 'direito-da-concorrencia', 'falencia-e-recuperacao-judicial', 'direito-digital', 'lei-geral-de-protecao-de-dados', 'direito-industrial'] },
  { titulo: 'Penal, ambiental e internacional', icone: 'bussola', slugs: ['direito-penal', 'processo-penal', 'direito-ambiental', 'direito-agrario', 'direito-da-energia', 'direito-internacional', 'direito-imigratorio', 'pro-bono'] },
];

// Uma linha por área para os cards. O começo dos textos antigos não servia (citações de lei, título repetido).
// Texto novo, descritivo, sem promessa: REVISAR com a Bruna.
export const RESUMO_AREA: Record<string, string> = {
  'direito-previdenciario': 'Benefícios do INSS e dos regimes próprios, do pedido ao recurso.',
  'aposentadoria': 'Quando e como pedir a aposentadoria pelas regras em vigor.',
  'revisao-da-aposentadoria': 'Análise do cálculo do benefício já concedido pelo INSS.',
  'planejamento-previdenciario': 'Estudo das contribuições para escolher a melhor regra e o melhor momento.',
  'simular-aposentadoria': 'Estimativa do valor do benefício conforme as contribuições.',
  'reforma-previdenciaria': 'O que mudou com a Emenda Constitucional 103/2019 e as regras de transição.',
  'trabalhista': 'Assessoria preventiva e atuação em processos trabalhistas.',
  'direito-do-trabalho-individual-e-coletivo': 'Relações de emprego e negociações entre empresas e categorias.',
  'meus-direitos-trabalhistas': 'Os direitos básicos de quem trabalha com carteira assinada.',
  'negociacao-coletiva': 'Acordos e convenções coletivas entre sindicatos e empregadores.',
  'direito-sindical': 'Relações entre sindicatos, trabalhadores e empregadores.',
  'direito-civil': 'Contratos, responsabilidade civil, obrigações e bens.',
  'direito-de-familia-e-sucessoes': 'Divórcio, guarda, pensão alimentícia, inventário e herança.',
  'direito-do-consumidor': 'Defesa de quem compra produtos e contrata serviços.',
  'direito-bancario': 'Contratos com bancos, empréstimos, juros e cobranças.',
  'direito-a-saude': 'Acesso a tratamentos e medicamentos pelo SUS e por planos.',
  'planos-de-saude': 'Negativas de cobertura, reajustes e contratos de plano de saúde.',
  'direito-medico': 'Relação entre pacientes, médicos, clínicas e hospitais.',
  'direito-imobiliario': 'Compra, venda, locação e regularização de imóveis.',
  'direito-condominial': 'Orientação a síndicos e condomínios.',
  'leilao': 'Análise de riscos na compra de imóveis em leilão.',
  'direito-contratual': 'Elaboração, revisão e cumprimento de contratos.',
  'direito-administrativo': 'Relações com a administração pública e servidores.',
  'licitacoes-e-contratos': 'Participação em licitações e contratos com o poder público.',
  'direito-constitucional': 'Garantias e direitos fundamentais previstos na Constituição.',
  'direito-tributario': 'Impostos, contribuições e a relação com o fisco.',
  'tributario': 'Defesa em cobranças e discussões tributárias.',
  'planejamento-tributario': 'Redução legal da carga de tributos.',
  'holding': 'Organização de patrimônio e sucessão familiar por meio de empresas.',
  'compliance': 'Programas para cumprir normas e prevenir riscos legais.',
  'direito-penal': 'Defesa em investigações e processos criminais.',
  'direito-eleitoral': 'Candidaturas, prestação de contas e processos eleitorais.',
  'direito-digital': 'Relações e conflitos no ambiente digital.',
  'lei-geral-de-protecao-de-dados': 'Adequação à LGPD e tratamento de dados pessoais.',
  'direito-agrario': 'Propriedade rural, posse e contratos agrários.',
  'direito-industrial': 'Marcas, patentes e propriedade industrial.',
  'direito-internacional': 'Questões jurídicas que envolvem mais de um país.',
  // áreas trazidas do Anuário 2024/2025 (mesmo estilo: descritivo, sem promessa)
  'tribunais-superiores': 'Recursos e acompanhamento de causas no STF, STJ, TST, TSE e STM.',
  'atuacao-perante-o-congresso-nacional': 'Acompanhamento e assessoria na criação de normas, nos limites da lei.',
  'atuacao-perante-o-tribunal-de-contas': 'Processos no TCU e nos tribunais de contas dos estados.',
  'processo-administrativo-disciplinar': 'Defesa de servidores públicos em PAD.',
  'terceiro-setor': 'Organizações sociais, OSCIPs e parcerias com o poder público.',
  'direito-regulatorio': 'Relação de empresas com agências reguladoras e contratos públicos.',
  'concursos-publicos': 'Erros em editais, provas, cotas e nomeações.',
  'direitos-reais': 'Posse, propriedade, reintegração e ações reivindicatórias.',
  'processo-civil': 'Condução de processos na Justiça comum.',
  'direito-societario-e-empresarial': 'Constituição, reorganização e dissolução de empresas.',
  'processo-do-trabalho': 'Condução de ações na Justiça do Trabalho.',
  'recuperacao-de-credito': 'Recuperação de tributos pagos indevidamente nos últimos cinco anos.',
  'execucao': 'Cobrança de créditos judiciais e defesa de executados.',
  'direito-economico': 'Regulação de mercado e atuação perante o CADE.',
  'direito-da-concorrencia': 'Defesa da concorrência, fusões e condutas de mercado.',
  'falencia-e-recuperacao-judicial': 'Recuperação judicial, falência e defesa de credores.',
  'direito-comercial': 'Títulos de crédito, financiamento e relações com bancos.',
  'processo-penal': 'Garantias do acusado durante a investigação e o processo.',
  'direito-militar': 'Processos disciplinares e Justiça Militar.',
  'direito-ambiental': 'Proteção do meio ambiente e políticas ambientais.',
  'direito-imigratorio': 'Imigração, nacionalidade e cidadania.',
  'direito-da-energia': 'Energia elétrica, petróleo, gás e renováveis.',
  'direito-educacional': 'Contratos e relações entre escolas, alunos e professores.',
  'mediacao-e-arbitragem': 'Solução de conflitos fora do Judiciário.',
  'advocacia-extrajudicial': 'Divórcio, inventário e usucapião em cartório.',
  'pro-bono': 'Atuação social e o Instituto Cândido.',
};
