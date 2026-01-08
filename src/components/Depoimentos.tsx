
import { useLandingData } from '@/hooks/use-landing-data';

const Depoimentos = () => {
  const { data: landingData, isLoading } = useLandingData();
  
  const testimonials = landingData?.testimonials || [];
  const testimonialsSection = landingData?.testimonialsSection;

  return (
    <section id="depoimentos" className="py-20 relative">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-8 animate-fade-in">
            {testimonialsSection?.sectionTitle || "Depoimentos"}
          </h2>
          <p className="text-xl text-text-gray max-w-2xl mx-auto">
            {testimonialsSection?.sectionSubtitle || "O que nossos participantes dizem sobre a experiência UAIZOUK"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="glass-effect rounded-2xl p-8 card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6">
                <div className="text-6xl text-neon-magenta opacity-30 font-serif leading-none">"</div>
                <div 
                  className="text-text-gray leading-relaxed text-lg -mt-4 prose prose-invert prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: testimonial.testimonialText }}
                />
                <div className="text-6xl text-neon-magenta opacity-30 font-serif leading-none text-right -mt-4">"</div>
              </div>
              
              <div className="flex items-center">
                {testimonial.photoUrl ? (
                  <img 
                    src={testimonial.photoUrl} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-magenta to-neon-purple rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-bold text-white">
                      {testimonial.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-soft-white font-bold text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-neon-cyan text-sm font-medium">
                    {testimonial.cityState}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Depoimentos;
