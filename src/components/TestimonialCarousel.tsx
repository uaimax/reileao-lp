import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';

interface Testimonial {
  id: number;
  name: string;
  cityState: string;
  testimonialText: string;
  photoUrl: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
}

const TestimonialCarousel = () => {
  const { data: landingData } = useLandingData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = (landingData as any)?.testimonials?.filter((t: Testimonial) => t.isActive) || [];

  // Rotação automática a cada 8 segundos (mais discreto)
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 8000); // Aumentado de 4000ms para 8000ms

    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="text-center mb-6">
        <h3 className="text-lg md:text-xl font-medium text-text-gray mb-2">
          O que nossos participantes dizem
        </h3>
        <p className="text-sm text-text-gray/70">
          Depoimentos reais de quem já viveu a experiência
        </p>
      </div>

      <div
        className="relative bg-dark-bg/20 rounded-xl p-4 md:p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Testimonial Content */}
        <div className="text-center">
          <div className="mb-4">
            <Quote className="w-5 h-5 text-gray-500 opacity-40 mx-auto mb-3" />
            <div
              className="text-text-gray/80 leading-relaxed text-sm md:text-base italic max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: currentTestimonial.testimonialText }}
            />
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-center">
            {currentTestimonial.photoUrl ? (
              <img
                src={currentTestimonial.photoUrl}
                alt={currentTestimonial.name}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-gray-300">
                  {currentTestimonial.name[0]}
                </span>
              </div>
            )}
            <div className="text-left">
              <h4 className="text-text-gray font-medium text-sm">
                {currentTestimonial.name}
              </h4>
              <p className="text-text-gray/60 text-xs">
                {currentTestimonial.cityState}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {testimonials.length > 1 && (
          <>
            {/* Arrow Navigation */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-dark-bg/60 hover:bg-dark-bg/80 border border-gray-600/20 hover:border-gray-500/40 rounded-full p-1.5 transition-all duration-300 opacity-60 hover:opacity-100"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-dark-bg/60 hover:bg-dark-bg/80 border border-gray-600/20 hover:border-gray-500/40 rounded-full p-1.5 transition-all duration-300 opacity-60 hover:opacity-100"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-4 space-x-1.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-gray-400 scale-110'
                      : 'bg-gray-600/40 hover:bg-gray-500/60'
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-3">
              <div className="w-full bg-gray-700/20 rounded-full h-0.5">
                <div
                  className="bg-gray-500 h-0.5 rounded-full transition-all duration-200 ease-linear"
                  style={{
                    width: `${((currentIndex + 1) / testimonials.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Touch Instructions */}
      <div className="text-center mt-3 md:hidden">
        <p className="text-xs text-text-gray/50">
          Toque nas setas ou pontos para navegar
        </p>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
