import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

const FAQ = () => {
  const { data: landingData } = useLandingData();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  
  const faqs = landingData?.faqs as FaqItem[] || [];
  const faqSection = landingData?.faqSection;

  // Don't render if there are no active FAQs
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section id="faq" className="py-20 relative">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-6 animate-fade-in">
              {faqSection?.sectionTitle || "Perguntas Frequentes"}
            </h2>
            <p className="text-xl text-text-gray animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {faqSection?.sectionSubtitle || "Tire suas dúvidas sobre o UAIZOUK"}
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="glass-effect rounded-xl border border-neon-purple/20 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-neon-purple/5 transition-all duration-300 group"
                >
                  <h3 className="text-lg md:text-xl font-semibold text-soft-white group-hover:text-neon-cyan transition-colors duration-300">
                    {faq.question}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    {openItems.has(faq.id) ? (
                      <ChevronUp className="w-6 h-6 text-neon-purple group-hover:text-neon-cyan transition-colors duration-300" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-neon-purple group-hover:text-neon-cyan transition-colors duration-300" />
                    )}
                  </div>
                </button>
                
                {openItems.has(faq.id) && (
                  <div className="px-6 pb-6 border-t border-neon-purple/20">
                    <div 
                      className="text-text-gray leading-relaxed prose prose-invert prose-lg max-w-none pt-4"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;