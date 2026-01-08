import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface EmbeddedBrowserWarningProps {
  url: string;
  linkTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const EmbeddedBrowserWarning = ({
  url,
  linkTitle,
  isOpen,
  onClose,
  onContinue
}: EmbeddedBrowserWarningProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-dark-bg border-neon-purple/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neon-purple">
            <AlertTriangle className="w-5 h-5" />
            Navegador Embutido Detectado
          </DialogTitle>
          <DialogDescription className="text-text-gray">
            Você está usando um navegador embutido que pode ter limitações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <strong>Recomendação:</strong> Para uma melhor experiência, abra este link no seu navegador padrão.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-soft-white font-medium">
              {linkTitle || 'Link'}
            </p>
            <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border">
              <code className="text-xs text-gray-300 flex-1 truncate">
                {url}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyLink}
                className="text-gray-400 hover:text-white"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onContinue}
              className="flex-1 bg-neon-purple hover:bg-neon-purple/80"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Continuar Aqui
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


