# Sistema de Notificações e Gestão de Usuários - UAIZOUK

## Funcionalidades Implementadas

### 1. Sistema de Notificações

#### Funcionalidades:
- **Notificações em tempo real** para novos PRIMEIRINHOS cadastrados
- **Notificações em tempo real** para novas inscrições de eventos
- **Sino no header** com contador de notificações não lidas
- **Dropdown de notificações** com histórico das últimas 10 notificações
- **Navegação automática** ao clicar nas notificações (redireciona para a aba correspondente)
- **Marcar como lida** individual ou todas de uma vez

#### Como funciona:
1. Quando um novo lead do PRIMEIRINHO é criado (status 'approved'), uma notificação é enviada para todos os usuários ativos
2. Quando uma nova inscrição de evento é criada, uma notificação é enviada para todos os usuários ativos
3. O sistema faz polling a cada 30 segundos para buscar novas notificações
4. As notificações são exibidas no dropdown do sino no header

#### Estrutura do banco:
- **Tabela `notifications`**: Armazena todas as notificações
- **Tabela `notification_views`**: Controla quando o usuário visualizou cada tipo de notificação

### 2. Gestão de Usuários

#### Funcionalidades:
- **Listar todos os usuários** do sistema
- **Criar novos usuários** com email e senha
- **Ativar/Desativar usuários** (usuários inativos não conseguem fazer login)
- **Deletar usuários** (com confirmação)
- **Visualizar informações** de criação e última atualização

#### Como funciona:
1. Nova aba "Usuários" no painel administrativo
2. Interface simples para gerenciar usuários
3. Apenas usuários ativos recebem notificações
4. Senhas são criptografadas com bcrypt (salt rounds: 12)

## Arquivos Criados/Modificados

### Novos Arquivos:
- `migrations/add-notifications-system.sql` - Migração do banco de dados
- `src/components/painel/Notifications.tsx` - Componente de notificações
- `src/components/painel/UsersManager.tsx` - Componente de gestão de usuários

### Arquivos Modificados:
- `api/index.js` - Endpoints de notificações e gestão de usuários
- `src/components/painel/Topbar.tsx` - Integração do componente de notificações
- `src/components/painel/Sidebar.tsx` - Nova aba de usuários
- `src/pages/Painel.tsx` - Integração dos novos componentes
- `src/lib/api-client.ts` - Métodos genéricos HTTP

## Endpoints da API

### Notificações:
- `GET /api/notifications?email={email}` - Buscar notificações do usuário
- `POST /api/notifications/{id}/read` - Marcar notificação como lida
- `POST /api/notifications/read-all` - Marcar todas como lidas

### Usuários:
- `GET /api/users` - Listar todos os usuários
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/{id}` - Atualizar status do usuário
- `DELETE /api/users/{id}` - Deletar usuário

## Como Usar

### Para Administradores:
1. **Acesse a aba "Usuários"** no painel para gerenciar usuários
2. **Crie novos usuários** clicando em "Novo Usuário"
3. **Ative/Desative usuários** usando o switch na tabela
4. **Monitore notificações** através do sino no header

### Para Usuários:
1. **Faça login** no painel normalmente
2. **Veja notificações** no sino do header
3. **Clique nas notificações** para navegar para a seção correspondente
4. **Marque como lidas** as notificações visualizadas

## Segurança

- Senhas são criptografadas com bcrypt
- Apenas usuários ativos podem fazer login
- Notificações são específicas por usuário
- Validação de email obrigatória para criação de usuários

## Próximos Passos Sugeridos

1. **Notificações por email**: Enviar emails quando houver novas notificações
2. **Configurações de notificação**: Permitir usuários escolherem quais tipos de notificação receber
3. **Histórico completo**: Página dedicada para ver todas as notificações
4. **Permissões granulares**: Diferentes níveis de acesso para usuários
5. **Auditoria**: Log de ações dos usuários no sistema
