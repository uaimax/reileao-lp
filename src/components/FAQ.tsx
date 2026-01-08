import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { SITE_NAME } from '@/lib/site-config';

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
  const { ref, isVisible } = useScrollAnimation();

  const allFaqs = landingData?.faqs as FaqItem[] || [];
  const faqSection = landingData?.faqSection;

  // Filtrar apenas FAQs ativos e ordenar por displayOrder
  const faqs = allFaqs
    .filter((faq) => faq.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Don't render if there are no active FAQs
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      // Fechar todos os outros e abrir apenas este
      newOpenItems.clear();
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section ref={ref} id="faq" className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: 'white' }}>
      <div className="container faq-container">
        <h2 className="section-title">
          {faqSection?.sectionTitle || "Perguntas Frequentes"}
        </h2>
        <div className="faq-list">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`faq-item ${openItems.has(faq.id) ? 'open' : ''}`}
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="faq-question"
              >
                <span>{faq.question}</span>
                {openItems.has(faq.id) ? (
                  <ChevronUp style={{ width: '20px', height: '20px', color: '#6B7280' }} />
                ) : (
                  <ChevronDown style={{ width: '20px', height: '20px', color: '#6B7280' }} />
                )}
              </button>
              <div className="faq-answer">
                <div
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
