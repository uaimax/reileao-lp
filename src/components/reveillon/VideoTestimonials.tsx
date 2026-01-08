import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const VideoTestimonials = () => {
  const { data: landingData } = useLandingData();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { ref, isVisible } = useScrollAnimation();

  // Vídeos de depoimentos do Reveillon
  const videos = [
    { id: '8W12dblQoBI', title: 'Minha primeira vez no Reveillon' },
    { id: 'zUk-Z7O_1z4', title: 'Eu criei muitas expectativas com o evento...' },
    { id: '3NZK9qozcgQ', title: 'Sobre o poder se conectar profundamente...' },
    { id: 'pGAUNM39bNk', title: 'Me preocupo com verdadeiramente com quem está aqui...' }
  ];

  const openVideo = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <section ref={ref} className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: '#F9FAFB' }}>
        <div className="container" style={{ maxWidth: '72rem' }}>
          <h2 className="section-title">O QUE DIZEM SOBRE O REVEILLON</h2>
          <p style={{ fontSize: '1.125rem', color: '#374151', textAlign: 'center', marginBottom: '4rem', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.75' }}>
            Até parece que essas pessoas se conhecem há muitos anos, algumas delas estavam no evento pela primeira vez, e construíram as amizades ali mesmo, dá pra acreditar?
          </p>
          <div className="testimonials-grid">
            {videos.map((video) => (
              <div
                key={video.id}
                className="testimonial-card"
                onClick={() => openVideo(video.id)}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="testimonial-thumbnail"
                />
                <div className="testimonial-overlay"></div>
                <div className="testimonial-play">
                  <div className="testimonial-play-button">
                    <Play style={{ width: '24px', height: '24px', color: 'black', marginLeft: '2px' }} fill="black" />
                  </div>
                </div>
                <div className="testimonial-title">{video.title}</div>
                <div className="testimonial-badge">Short</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="modal-overlay open"
          onClick={closeVideo}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
              className="modal-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={closeVideo}
              className="modal-close"
            >
              <X style={{ width: '24px', height: '24px', color: 'white' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoTestimonials;

