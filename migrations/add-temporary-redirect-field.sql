-- Adicionar campo de redirecionamento temporário na tabela event_config
-- Este campo permite redirecionar temporariamente a página principal para outra URL

ALTER TABLE event_config 
ADD COLUMN temporary_redirect_url TEXT DEFAULT NULL;

-- Comentário explicativo
COMMENT ON COLUMN event_config.temporary_redirect_url IS 'URL para redirecionamento temporário da página principal. Se preenchido, redireciona apenas a rota "/" para esta URL.';
