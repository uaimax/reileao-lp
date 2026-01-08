# Checklist de Deploy em Produção

## Pré-requisitos

### 1. Servidor
- [ ] Servidor com Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado e configurado
- [ ] Nginx ou Apache configurado
- [ ] Certificado SSL válido
- [ ] Domínio configurado (uaizouk.com)

### 2. Banco de Dados
- [ ] Banco PostgreSQL criado
- [ ] Usuário com permissões adequadas
- [ ] Backup automático configurado
- [ ] Monitoramento de performance

### 3. ASAAS
- [ ] Conta ASAAS ativa
- [ ] Chave PIX configurada
- [ ] Chaves de API de produção
- [ ] Webhooks configurados (opcional)

## Configuração do Ambiente

### 1. Variáveis de Ambiente

Criar arquivo `.env` no servidor:

```bash
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/uaizouk_prod

# ASAAS
ASAAS_API_KEY_PRODUCTION=your_production_key_here
ASAAS_SANDBOX=false

# Node.js
NODE_ENV=production
PORT=3002

# Domínio
DOMAIN=https://uaizouk.com
```

### 2. Estrutura de Diretórios

```bash
/var/www/uaizouk-lp-dinamic/
├── api/
├── src/
├── .env
├── package.json
├── schema.sql
└── .context/
```

### 3. Dependências

```bash
# Instalar dependências
npm install --production

# Build do frontend (se necessário)
npm run build
```

## Configuração do Banco de Dados

### 1. Criar Banco

```sql
CREATE DATABASE uaizouk_prod;
CREATE USER uaizouk_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE uaizouk_prod TO uaizouk_user;
```

### 2. Executar Migrações

```bash
# Conectar ao banco
psql -h localhost -U uaizouk_user -d uaizouk_prod

# Executar schema
\i schema.sql

# Verificar tabelas
\dt
```

### 3. Configurar Backup

```bash
# Script de backup diário
#!/bin/bash
pg_dump -h localhost -U uaizouk_user -d uaizouk_prod > /backups/uaizouk_$(date +%Y%m%d).sql

# Adicionar ao crontab
0 2 * * * /path/to/backup_script.sh
```

## Configuração do Servidor Web

### 1. Nginx

```nginx
server {
    listen 80;
    server_name uaizouk.com www.uaizouk.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name uaizouk.com www.uaizouk.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /var/www/uaizouk-lp-dinamic/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/uaizouk_access.log;
    error_log /var/log/nginx/uaizouk_error.log;
}
```

### 2. Apache (Alternativa)

```apache
<VirtualHost *:80>
    ServerName uaizouk.com
    ServerAlias www.uaizouk.com
    Redirect permanent / https://uaizouk.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName uaizouk.com
    ServerAlias www.uaizouk.com
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    DocumentRoot /var/www/uaizouk-lp-dinamic/dist
    
    # API
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3002/api
    ProxyPassReverse /api http://localhost:3002/api
    
    # Logs
    ErrorLog /var/log/apache2/uaizouk_error.log
    CustomLog /var/log/apache2/uaizouk_access.log combined
</VirtualHost>
```

## Configuração do Node.js

### 1. PM2

```bash
# Instalar PM2
npm install -g pm2

# Configurar PM2
pm2 start api/index.js --name "uaizouk-api" --env production

# Salvar configuração
pm2 save
pm2 startup
```

### 2. Configuração PM2

```json
{
  "apps": [
    {
      "name": "uaizouk-api",
      "script": "api/index.js",
      "cwd": "/var/www/uaizouk-lp-dinamic",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3002
      },
      "instances": 2,
      "exec_mode": "cluster",
      "max_memory_restart": "1G",
      "error_file": "/var/log/pm2/uaizouk-error.log",
      "out_file": "/var/log/pm2/uaizouk-out.log",
      "log_file": "/var/log/pm2/uaizouk.log"
    }
  ]
}
```

## Configuração de Segurança

### 1. Firewall

```bash
# UFW
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# iptables (alternativa)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

### 2. SSL/TLS

```bash
# Let's Encrypt
certbot --nginx -d uaizouk.com -d www.uaizouk.com

# Renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 3. Headers de Segurança

```nginx
# Adicionar ao Nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Monitoramento

### 1. Logs

```bash
# Logs da aplicação
tail -f /var/log/pm2/uaizouk.log

# Logs do Nginx
tail -f /var/log/nginx/uaizouk_access.log
tail -f /var/log/nginx/uaizouk_error.log

# Logs do sistema
journalctl -u nginx -f
```

### 2. Métricas

```bash
# CPU e Memória
htop

# Disco
df -h

# Rede
netstat -tulpn

# Processos Node.js
pm2 monit
```

### 3. Alertas

```bash
# Script de monitoramento
#!/bin/bash
# Verificar se a API está respondendo
if ! curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "API não está respondendo" | mail -s "Alerta UAIZOUK" admin@uaizouk.com
fi

# Adicionar ao crontab (verificar a cada 5 minutos)
*/5 * * * * /path/to/monitor_script.sh
```

## Testes de Produção

### 1. Testes Básicos

```bash
# Health check
curl https://uaizouk.com/api/health

# Teste de banco
curl https://uaizouk.com/api/test-db

# Configuração do formulário
curl https://uaizouk.com/api/form-config
```

### 2. Testes de Inscrição

```bash
# Criar inscrição de teste
curl -X POST https://uaizouk.com/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "full_name": "Teste Produção",
    "email": "teste@example.com",
    "whatsapp": "+5511999999999",
    "birth_date": "1990-01-01",
    "ticket_type": "Individual",
    "total": 350.00,
    "terms_accepted": true,
    "payment_method": "pix"
  }'
```

### 3. Testes de Pagamento

```bash
# Criar checkout (usar ID da inscrição de teste)
curl -X POST https://uaizouk.com/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": 1}'
```

## Rollback

### 1. Backup Antes do Deploy

```bash
# Backup do código
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/uaizouk-lp-dinamic

# Backup do banco
pg_dump -h localhost -U uaizouk_user -d uaizouk_prod > backup_db_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Procedimento de Rollback

```bash
# Parar aplicação
pm2 stop uaizouk-api

# Restaurar código
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /

# Restaurar banco (se necessário)
psql -h localhost -U uaizouk_user -d uaizouk_prod < backup_db_YYYYMMDD_HHMMSS.sql

# Reiniciar aplicação
pm2 start uaizouk-api
```

## Checklist Final

### Antes do Deploy
- [ ] Código testado em desenvolvimento
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente definidas
- [ ] Certificado SSL válido
- [ ] Backup configurado
- [ ] Monitoramento configurado

### Durante o Deploy
- [ ] Backup do sistema atual
- [ ] Deploy do novo código
- [ ] Executar migrações (se necessário)
- [ ] Reiniciar serviços
- [ ] Verificar logs

### Após o Deploy
- [ ] Testes básicos funcionando
- [ ] Formulário de inscrição funcionando
- [ ] Pagamentos funcionando
- [ ] Monitoramento ativo
- [ ] Logs sem erros

### Validação Final
- [ ] Site carregando corretamente
- [ ] Formulário de inscrição funcional
- [ ] Painel administrativo acessível
- [ ] Pagamentos processando
- [ ] Emails de confirmação enviando
- [ ] Performance adequada

## Contatos de Emergência

- **Desenvolvedor**: [seu-email@example.com]
- **ASAAS Suporte**: [suporte@asaas.com]
- **Hospedagem**: [suporte@hospedagem.com]
- **Domínio**: [suporte@registro.com]

## Documentação Adicional

- [Logs de Deploy](.context/deployment-logs.md)
- [Troubleshooting](.context/troubleshooting.md)
- [Monitoramento](.context/monitoring.md)
- [Backup e Restore](.context/backup-restore.md)

