# Log de Decisões Técnicas

## 1. Arquitetura do Sistema

### Decisão: Sistema de Configuração Dinâmica
**Data**: 2025-10-02
**Contexto**: Necessidade de criar um sistema flexível para configurar formulários de inscrição
**Decisão**: Implementar sistema baseado em JSONB no PostgreSQL para máxima flexibilidade
**Justificativa**: 
- Permite configuração sem necessidade de alterações no código
- Suporta diferentes tipos de eventos
- Facilita manutenção e evolução

### Decisão: Estrutura de Dados
**Data**: 2025-10-02
**Contexto**: Como armazenar configurações e inscrições
**Decisão**: 
- Tabela `event_form_configs` com campo `config_data` JSONB
- Tabela `event_registrations` com campos específicos + `selected_products` JSONB
- Campo `is_active` com constraint única para garantir apenas uma configuração ativa
**Justificativa**:
- JSONB oferece flexibilidade para diferentes tipos de produtos
- Campos específicos para dados comuns (nome, email, etc.)
- Constraint única garante integridade dos dados

## 2. Interface Administrativa

### Decisão: Painel Administrativo Integrado
**Data**: 2025-10-02
**Contexto**: Onde colocar a configuração do formulário
**Decisão**: Integrar no painel administrativo existente como nova aba
**Justificativa**:
- Reutiliza autenticação existente
- Mantém consistência da interface
- Facilita manutenção

### Decisão: Estrutura do Menu
**Data**: 2025-10-02
**Contexto**: Organização do menu administrativo
**Decisão**: 
- Criar grupo "Inscrições" no menu
- Submenu "Configuração do Formulário"
- Submenu "Visualizar Inscrições"
**Justificativa**:
- Agrupa funcionalidades relacionadas
- Facilita navegação
- Escalável para futuras funcionalidades

## 3. Formulário de Inscrição

### Decisão: Progressive Disclosure
**Data**: 2025-10-02
**Contexto**: UX do formulário de inscrição
**Decisão**: Implementar interface estilo Typeform com seções progressivas
**Justificativa**:
- Reduz carga cognitiva do usuário
- Melhora taxa de conversão
- Interface mais moderna e intuitiva

### Decisão: Validação no Submit
**Data**: 2025-10-02
**Contexto**: Quando validar o formulário
**Decisão**: Validar apenas quando o botão de submit for pressionado
**Justificativa**:
- Evita frustração do usuário
- Permite preenchimento livre
- Validação mais eficiente

### Decisão: Campo WhatsApp Internacional
**Data**: 2025-10-02
**Contexto**: Suporte a participantes internacionais
**Decisão**: Usar `react-phone-number-input` com seletor de país
**Justificativa**:
- Suporte nativo a números internacionais
- Interface intuitiva com bandeiras
- Validação automática de formato

## 4. Sistema de Pagamentos

### Decisão: Integração ASAAS
**Data**: 2025-10-02
**Contexto**: Processamento de pagamentos
**Decisão**: Usar ASAAS como gateway de pagamento
**Justificativa**:
- Suporte nativo a PIX e cartão
- API robusta e documentada
- Boa reputação no mercado brasileiro

### Decisão: Alternância Sandbox/Produção
**Data**: 2025-10-02
**Contexto**: Como gerenciar ambientes
**Decisão**: Usar variável `ASAAS_SANDBOX` para alternar ambientes
**Justificativa**:
- Controle simples via variável de ambiente
- Facilita testes e deploy
- Evita configuração manual

### Decisão: Lógica de Taxas
**Data**: 2025-10-02
**Contexto**: Como aplicar taxas e descontos
**Decisão**: 
- PIX à vista: sem taxa do sistema (desconto efetivo)
- PIX parcelado: +5% taxa do sistema
- Cartão de crédito: +5% taxa do sistema
**Justificativa**:
- Conforme legislação brasileira
- PIX à vista como opção mais atrativa
- Transparência nas taxas

### Decisão: Cálculo Automático de Parcelas
**Data**: 2025-10-02
**Contexto**: Como determinar máximo de parcelas
**Decisão**: Calcular automaticamente baseado na data limite de vencimento
**Justificativa**:
- Evita configuração manual
- Garante que parcelas não ultrapassem data limite
- Lógica mais robusta

## 5. Descrição de Itens no ASAAS

### Decisão: Descrição Detalhada
**Data**: 2025-10-02
**Contexto**: Como descrever itens no checkout
**Decisão**: Incluir nome do evento, tipo de ingresso, produtos adicionais e forma de pagamento
**Justificativa**:
- Transparência para o cliente
- Facilita identificação da compra
- Melhora experiência do usuário

### Decisão: Remoção de Informações de Dupla
**Data**: 2025-10-02
**Contexto**: Simplificação da descrição
**Decisão**: Remover trecho "(Dupla: Nome da dupla)" da descrição
**Justificativa**:
- Descrição mais limpa
- Informação não essencial para o pagamento
- Foco nas informações principais

## 6. Estrutura de Arquivos

### Decisão: Organização de Componentes
**Data**: 2025-10-02
**Contexto**: Como organizar componentes React
**Decisão**: 
- `src/components/painel/` para componentes administrativos
- `src/pages/` para páginas principais
- `src/lib/` para utilitários e configurações
**Justificativa**:
- Separação clara de responsabilidades
- Facilita manutenção
- Escalável para crescimento

### Decisão: Schema Drizzle ORM
**Data**: 2025-10-02
**Contexto**: Como definir schema do banco
**Decisão**: Usar Drizzle ORM com TypeScript
**Justificativa**:
- Type safety
- Migrations automáticas
- Boa performance
- Sintaxe intuitiva

## 7. Configuração de Ambiente

### Decisão: Variáveis de Ambiente
**Data**: 2025-10-02
**Contexto**: Como gerenciar configurações
**Decisão**: 
- `.env` para desenvolvimento local
- `.cursor/mcp.json` para MCP/Cursor
- `ASAAS_SANDBOX` para alternar ambientes
**Justificativa**:
- Separação de ambientes
- Segurança de dados sensíveis
- Facilita deploy

## 8. Validações e Segurança

### Decisão: Validação Backend
**Data**: 2025-10-02
**Contexto**: Como garantir integridade dos dados
**Decisão**: Validação completa no backend para todos os campos
**Justificativa**:
- Segurança contra manipulação
- Integridade dos dados
- Validação centralizada

### Decisão: Sanitização de Dados
**Data**: 2025-10-02
**Contexto**: Prevenção de ataques
**Decisão**: Sanitizar todos os inputs antes de processar
**Justificativa**:
- Prevenção de SQL injection
- Segurança geral
- Boas práticas

## 9. Performance e UX

### Decisão: Loading States
**Data**: 2025-10-02
**Contexto**: Feedback visual para usuário
**Decisão**: Implementar loading states em todas as operações assíncronas
**Justificativa**:
- Melhora experiência do usuário
- Indica progresso
- Evita confusão

### Decisão: Error Handling
**Data**: 2025-10-02
**Contexto**: Como tratar erros
**Decisão**: Tratamento robusto com mensagens claras para o usuário
**Justificativa**:
- Transparência
- Facilita debugging
- Melhora experiência

## 10. Manutenibilidade

### Decisão: Código Reutilizável
**Data**: 2025-10-02
**Contexto**: Como facilitar manutenção
**Decisão**: Criar componentes reutilizáveis e funções utilitárias
**Justificativa**:
- Reduz duplicação
- Facilita manutenção
- Consistência na interface

### Decisão: Documentação
**Data**: 2025-10-02
**Contexto**: Como manter conhecimento do sistema
**Decisão**: Documentar todas as decisões e implementações
**Justificativa**:
- Facilita onboarding
- Preserva conhecimento
- Ajuda em troubleshooting

