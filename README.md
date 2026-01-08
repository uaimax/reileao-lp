# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/22a28483-3aea-4f45-91c8-7c841ebb6e9c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/22a28483-3aea-4f45-91c8-7c841ebb6e9c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure as variáveis de ambiente
# Copie o arquivo _save_env para .env (ou configure manualmente)
cp _save_env .env

# Step 5: Inicie o projeto completo (Frontend + API)
./dev-start.sh

# OU inicie apenas o frontend:
npm run dev

# OU inicie apenas a API:
npm run dev:api
```

## 🚀 Iniciando o Projeto

### Forma Mais Fácil (Recomendado)

Use o script `./dev-start.sh` que inicia automaticamente o frontend e a API:

```sh
./dev-start.sh
```

Este script:
- ✅ Verifica se as portas estão disponíveis
- ✅ Configura automaticamente `VITE_API_URL`
- ✅ Inicia a API na porta 3002
- ✅ Inicia o Frontend na porta 5173
- ✅ Carrega variáveis de ambiente do arquivo `_save_env`

### Configurando Portas Personalizadas

Se precisar usar portas diferentes (para evitar conflitos):

```sh
# Frontend na porta 5174 e API na porta 3003
FRONTEND_PORT=5174 API_PORT=3003 ./dev-start.sh
```

### Variáveis de Ambiente

O projeto precisa do arquivo `_save_env` na raiz com as seguintes variáveis:

- `DATABASE_URL` - URL de conexão do PostgreSQL
- `VITE_API_URL` - URL da API (configurado automaticamente pelo script)
- `VITE_SITE_NAME` - Nome do site (padrão: 'UAIZOUK')
- `ASAAS_SANDBOX` - Modo sandbox do Asaas
- `ASAAS_API_KEY_SANDBOX` - Chave da API Asaas (sandbox)
- `ASAAS_API_KEY_PRODUCTION` - Chave da API Asaas (produção)

**Nota:** O script `./dev-start.sh` configura automaticamente `VITE_API_URL` baseado na porta da API, então você não precisa configurá-la manualmente no `_save_env` para desenvolvimento.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/22a28483-3aea-4f45-91c8-7c841ebb6e9c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
