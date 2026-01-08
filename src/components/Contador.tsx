
import { useState, useEffect } from 'react';
import { useLandingData } from '@/hooks/use-landing-data';

const Contador = () => {
  const { data: landingData } = useLandingData();
  const statsData = landingData?.stats;

  const [counts, setCounts] = useState({
    participantes: 0,
    professores: 0,
    djs: 0,
    horas: 0
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // Usar dados do CMS ou fallback para valores padrão
  const finalCounts = {
    participantes: statsData?.participantsCount || 3190,
    professores: statsData?.teachersCount || 56,
    djs: statsData?.djsCount || 25,
    horas: statsData?.partyHoursCount || 300
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isAnimating) {
          setIsAnimating(true);
          startCountAnimation();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('contador');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isAnimating]);

  const startCountAnimation = () => {
    const duration = 2500; // 2.5 seconds
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Easing function for smooth acceleration and deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        
        Object.keys(finalCounts).forEach(key => {
          const finalValue = finalCounts[key as keyof typeof finalCounts];
          const currentValue = Math.floor(finalValue * easeOutQuart);
          newCounts[key as keyof typeof newCounts] = currentValue;
        });

        return newCounts;
      });

      if (frame >= totalFrames) {
        clearInterval(timer);
        // Ensure final values are exact
        setCounts(finalCounts);
      }
    }, 1000 / frameRate);
  };

  const stats = [
    {
      number: counts.participantes,
      label: statsData?.participantsLabel || 'Participantes',
      color: 'text-neon-magenta'
    },
    {
      number: counts.professores,
      label: statsData?.teachersLabel || 'Professores',
      color: 'text-neon-purple'
    },
    {
      number: counts.djs,
      label: statsData?.djsLabel || 'DJs',
      color: 'text-neon-cyan'
    },
    {
      number: counts.horas,
      label: statsData?.partyHoursLabel || 'Horas de balada',
      color: 'text-neon-magenta'
    }
  ];

  return (
    <section id="contador" className="py-20 relative">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-soft-white mb-8 animate-fade-in">
            {statsData?.sectionTitle || "Já passaram pelo UAIZOUK mais de"}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-effect rounded-2xl p-8 text-center card-hover animate-flip-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-5xl md:text-6xl font-extrabold ${stat.color} neon-glow mb-4 font-mono overflow-hidden`}>
                <span 
                  className={`inline-block transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}
                  style={{
                    transform: isAnimating ? 'translateY(-2px)' : 'translateY(0)',
                    textShadow: isAnimating ? '0 0 15px currentColor' : '0 0 10px currentColor'
                  }}
                >
                  {stat.number.toLocaleString()}
                </span>
              </div>
              <div className="text-text-gray font-medium text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contador;
