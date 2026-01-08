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
        <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
          O que nossos participantes dizem
        </h3>
        <p className="text-sm text-slate-500">
          Depoimentos reais de quem já viveu a experiência
        </p>
      </div>

      <div
        className="relative bg-white rounded-xl p-4 md:p-6 border-2 border-slate-200 hover:border-yellow-500 shadow-md hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Testimonial Content */}
        <div className="text-center">
          <div className="mb-4">
            <Quote className="w-6 h-6 text-yellow-500 opacity-60 mx-auto mb-3" />
            <div
              className="text-slate-900 leading-relaxed text-sm md:text-base italic max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: currentTestimonial.testimonialText }}
            />
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-center">
            {currentTestimonial.photoUrl ? (
              <img
                src={currentTestimonial.photoUrl}
                alt={currentTestimonial.name}
                className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-3 border-2 border-slate-200">
                <span className="text-sm font-semibold text-slate-900">
                  {currentTestimonial.name[0]}
                </span>
              </div>
            )}
            <div className="text-left">
              <h4 className="text-slate-900 font-semibold text-sm">
                {currentTestimonial.name}
              </h4>
              <p className="text-slate-500 text-xs">
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
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-yellow-500 rounded-full p-2 transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-yellow-500 rounded-full p-2 transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-5 h-5 text-slate-900" />
            </button>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-yellow-500 scale-125 shadow-md'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-1">
                <div
                  className="bg-yellow-500 h-1 rounded-full transition-all duration-200 ease-linear"
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
        <p className="text-xs text-slate-500">
          Toque nas setas ou pontos para navegar
        </p>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
