import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToS3 } from '@/lib/s3-client';

interface FileUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
  maxSize?: number; // em MB
}

const FileUpload = ({
  label,
  value,
  onChange,
  accept = "image/*,.pdf",
  folder = "uploads",
  maxSize = 10
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    // Verificar tipo do arquivo
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === type;
    });

    if (!isAccepted) {
      toast.error('Tipo de arquivo não permitido');
      return;
    }

    setIsUploading(true);
    try {
      // Fazer upload real para o Cloudflare R2
      const uploadedUrl = await uploadToS3(file, folder);

      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success('Arquivo enviado com sucesso!');
      } else {
        throw new Error('Falha no upload');
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-50">
          {label}
        </label>
      )}

      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
        {value ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <File className="w-5 h-5 text-yellow-500" />
              <span className="text-slate-50 text-sm truncate max-w-xs">
                {value.split('/').pop()}
              </span>
            </div>
            <Button
              onClick={handleRemove}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-1" />
              Remover
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-yellow-500 mx-auto" />
            <div className="text-slate-50">
              <p className="font-medium">Clique para selecionar um arquivo</p>
              <p className="text-sm text-slate-400">
                ou arraste e solte aqui
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Tamanho máximo: {maxSize}MB
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
            >
              {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export { FileUpload };
