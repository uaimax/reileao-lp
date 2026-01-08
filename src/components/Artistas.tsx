import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLandingData } from '@/hooks/use-landing-data';
import ArtistModal from '@/components/ui/artist-modal';
import { useState } from 'react';

interface Artist {
  id: number;
  name: string;
  role: string;
  cityState: string;
  photoUrl?: string;
  description?: string;
  promotionalVideoUrl?: string;
}

// Adicione uma função utilitária para checar se a descrição é "vazia" mesmo sendo texto rico
function isRichTextEmpty(html: string | undefined): boolean {
  if (!html) return true;
  // Remove tags e espaços/quebras de linha
  const text = html.replace(/<[^>]+>/g, '').replace(/\s|&nbsp;/g, '');
  return text.length === 0;
}

const Artistas = () => {
  const { data: landingData, isLoading } = useLandingData();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
  };

  const artists = landingData?.artists || [];
  const artistsSection = landingData?.artistsSection;
  const eventData = landingData?.event;

  const colors = ['text-neon-magenta', 'text-neon-purple', 'text-neon-cyan', 'text-neon-green'];

  return (
    <section id="artistas" className="py-20 relative yolo-optimize">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-8 animate-fade-in yolo-bounce">
            {artistsSection?.sectionTitle || "Artistas Confirmados"}
          </h2>
          <p className="text-xl text-text-gray max-w-2xl mx-auto leading-relaxed">
            {artistsSection?.sectionSubtitle || "Professores e DJs renomados que farão parte desta experiência única"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {artists.map((artist, index) => {
            const hasDescription = !!artist.description && !isRichTextEmpty(artist.description);
            const hasVideo = !!artist.promotionalVideoUrl && artist.promotionalVideoUrl.trim() !== '';
            const canOpenModal = hasDescription || hasVideo;
            return (
              <div
                key={artist.id}
                className={`glass-effect rounded-2xl overflow-hidden card-hover animate-slide-up group ${canOpenModal ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={canOpenModal ? () => handleArtistClick(artist) : undefined}
              >
                {/* Foto como destaque principal com proporção 1:1 */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={artist.photoUrl || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400'}
                    alt={`Foto de ${artist.name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-transparent to-transparent" />

                  {/* Badge da cidade */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-neon-purple/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                      {artist.cityState}
                    </span>
                  </div>
                </div>

                {/* Informações do artista */}
                <div className="p-6">
                  <h3 className={`text-2xl font-bold ${colors[index % colors.length]} neon-glow mb-2`}>
                    {artist.name}
                  </h3>
                  <p className="text-text-gray font-medium text-lg mb-3">
                    {artist.role}
                  </p>
                  {/* Descrição removida da listagem */}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            onClick={() => window.open(eventData?.registrationUrl || 'https://uaizouk.com.br/inscricoes', '_blank')}
            className="btn-neon text-white font-bold py-4 px-12 rounded-full text-xl animate-glow-pulse"
          >
            {artistsSection?.ctaButtonText || "QUERO PARTICIPAR"}
          </Button>
        </div>
      </div>

      <ArtistModal
        artist={selectedArtist}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Artistas;
