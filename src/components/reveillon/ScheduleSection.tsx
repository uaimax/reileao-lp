import { useState } from 'react';
import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Instagram, X } from 'lucide-react';

const ScheduleSection = () => {
  const { data: landingData } = useLandingData();
  const { ref, isVisible } = useScrollAnimation();
  const [selectedDj, setSelectedDj] = useState<{ name: string; image: string } | null>(null);
  const eventData = landingData?.event;

  const tips = [
    {
      number: '1',
      text: 'Se programe para chegar na quarta-feira (31/12) a partir das 14:59.'
    },
    {
      number: '2',
      text: 'Se programe para ir embora no dia 04 às 09 da manhã.'
    },
    {
      icon: '📶',
      text: 'O 4G ou 5G de algumas operadoras pegam normalmente no local, pra quem precisa fazer um home-office em algum momento (algumas pessoas fizeram calls de lá sem problemas).'
    }
  ];

  const djs = [
    { name: 'Ju Sanper', image: '/assets/reveillon/djs/jusanper.png' },
    { name: 'Zé do Lago', image: '/assets/reveillon/djs/zedolago.png' }
  ];

  return (
    <>
      <section ref={ref} className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: '#F9FAFB' }}>
        <div className="container" style={{ maxWidth: '56rem' }}>
          <h2 className="section-title">Programação</h2>
          <div className="text-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p>A programação do Reveillon é tudo e nada ao mesmo tempo. Espere começando uma rodinha de violão, algumas pessoas lendo, outras na piscina.</p>
            <p>Se você quer fazer atividades (aprendizado) com Luan e Adriana também sem seu momento, imagine um lugar para você apenas SER, ao som dos pássaros e em contato com a natureza</p>
          </div>

          {/* Instagram Notice */}
          <div className="schedule-notice">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Instagram style={{ width: '24px', height: '24px', color: '#EC4899' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '600', textAlign: 'center' }}>
                Em breve a programação completa estará no nosso instagram{' '}
                <a
                  href="https://instagram.com/reileaouberlandia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#EC4899', fontWeight: 'bold', textDecoration: 'none' }}
                >
                  @reileaouberlandia
                </a>
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="schedule-tips">
            <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Enquanto a programação não sai, vão umas dicas:</h3>
            <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
              {tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  {tip.icon ? (
                    <span className="tip-number" style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                      {tip.icon}
                    </span>
                  ) : (
                    <span className="tip-number">{tip.number}</span>
                  )}
                  <p style={{ fontSize: '1.125rem', color: '#374151', margin: 0 }}>
                    {tip.text.split(/(quarta-feira \(31\/12\)|dia 04)/).map((part, i) => {
                      if (part.includes('quarta-feira (31/12)') || part.includes('dia 04')) {
                        return <strong key={i}>{part}</strong>;
                      }
                      return part;
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DJs */}
          <div style={{ marginTop: '3rem' }}>
            <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>DJs</h3>
            <div className="djs-container">
              {djs.map((dj, index) => (
                <div
                  key={index}
                  className="dj-card"
                  onClick={() => setSelectedDj(dj)}
                >
                  <img
                    src={dj.image}
                    alt={dj.name}
                    className="dj-image"
                  />
                  <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{dj.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DJ Modal */}
      {selectedDj && (
        <div
          className="modal-overlay open"
          onClick={() => setSelectedDj(null)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '42rem', aspectRatio: 'auto', background: 'transparent', border: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedDj.image}
              alt={selectedDj.name}
              style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)' }}
            />
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.25rem', fontFamily: "'Bebas Neue', sans-serif", color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
              {selectedDj.name}
            </p>
            <button
              onClick={() => setSelectedDj(null)}
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

export default ScheduleSection;

