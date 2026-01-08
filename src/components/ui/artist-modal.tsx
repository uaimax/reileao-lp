import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Artist {
  id: number;
  name: string;
  role: string;
  cityState: string;
  photoUrl?: string;
  description?: string;
  promotionalVideoUrl?: string;
}

interface ArtistModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
}

const ArtistModal = ({ artist, isOpen, onClose }: ArtistModalProps) => {
  if (!artist) return null;

  const hasVideo = artist.promotionalVideoUrl && artist.promotionalVideoUrl.trim() !== '';
  const hasDescription = artist.description && artist.description.trim() !== '';

  // Função para extrair o ID do vídeo do YouTube e criar URL mais limpa
  const getCleanYouTubeUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?rel=0&modestbranding=1&showinfo=0`;
    }
    return url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] sm:max-h-[90vh] bg-slate-800 border-2 border-slate-700 rounded-2xl p-0 overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Perfil de {artist.name}</DialogTitle>
          <DialogDescription>
            {hasVideo ? 'Vídeo promocional e' : 'Foto e'} informações sobre {artist.name}, {artist.role} de {artist.cityState}
          </DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col lg:flex-row min-h-0">
          <div className="lg:w-1/2 relative">
            {hasVideo ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getCleanYouTubeUrl(artist.promotionalVideoUrl)}
                  title={`Vídeo promocional de ${artist.name}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-video w-full relative overflow-hidden">
                <img
                  src={artist.photoUrl || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&h=600'}
                  alt={`Foto de ${artist.name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              </div>
            )}
          </div>

          <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-0">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="bg-yellow-500/20 text-yellow-500 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold border border-yellow-500/30">
                  {artist.cityState}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-50 mb-2">
                  {artist.name}
                </h2>
                <p className="text-lg sm:text-xl text-slate-400 font-medium">
                  {artist.role}
                </p>
              </div>

              {hasDescription && (
                <div className="max-h-40 sm:max-h-60 lg:max-h-none overflow-y-auto">
                  <div
                    className="text-slate-400 text-sm sm:text-base leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: artist.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistModal;
