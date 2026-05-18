import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingWhatsApp() {
  const phone = '5571992106043';
  const message = encodeURIComponent('Olá! Vim pelo site Studio Modesto e gostaria de agendar um horário.');
  const link = `https://wa.me/${phone}?text=${message}`;

  const [visible, setVisible] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(false); // Default: starts false (light section)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // 1. Visibility (shows after 100px)
      setVisible(scrollY > 100);

      // 2. Dynamic Color Logic
      const sections = document.querySelectorAll('section, header, footer');
      
      // Trigger point
      const buttonPosition = window.innerHeight - 80;

      let currentSectionIsDark = false;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        if (rect.top <= buttonPosition && rect.bottom >= buttonPosition) {
          const sectionId = section.id;
          
          // Se a seção for o contato (dark), o botão fica DOURADO (Aceso).
          // Se não (light), o botão fica PRETO/STEALTH.
          if (sectionId === 'contato') {
            currentSectionIsDark = true;
          } else {
            currentSectionIsDark = false;
          }
        }
      });

      setIsDarkSection(currentSectionIsDark);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Agendar via WhatsApp"
          className={`
            group fixed bottom-12 right-6 md:bottom-16 md:right-10 z-[100] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 hover:-translate-y-1 border
            ${isDarkSection 
              ? 'bg-aura-gold text-aura-charcoal border-aura-gold shadow-lg hover:bg-white hover:border-white' 
              : 'bg-aura-charcoal text-aura-gold border-aura-charcoal shadow-lg hover:bg-aura-gold hover:text-aura-charcoal'}
          `}
        >
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            className="w-6 h-6 transition-transform duration-500 group-hover:scale-110"
          >
            <path d="M16 3C9.4 3 4 8 4 14.5c0 2.7 1 5.2 2.7 7.2L6 29l7.6-2.5c.7.2 1.6.3 2.4.3 6.6 0 12-5 12-11.5S22.6 3 16 3z" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.7 10.7c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .4-.4.4-1.3 1.3-1.3 3.2s1.3 3.7 1.5 4c.2.3 2.5 4 6.2 5.4 3 1.2 3.6 1 4.3.9.7-.1 2.2-.9 2.5-1.7.3-.8.3-1.5.2-1.7-.1-.2-.3-.3-.6-.5l-2.1-1c-.3-.1-.6-.2-.8.2-.2.4-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.1-1.5-.6-2.8-1.8-1-1-1.7-2.3-1.9-2.6-.2-.3 0-.5.1-.6.2-.2.3-.4.5-.6.2-.2.3-.4.4-.6.1-.2 0-.4 0-.6l-.9-2.2z" />
          </svg>

          <span
            className={`
              absolute right-16 whitespace-nowrap text-[10px] uppercase tracking-widest px-4 py-2 rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 font-medium border
              ${isDarkSection 
                ? 'bg-aura-gold text-aura-charcoal border-aura-gold shadow-lg' 
                : 'bg-aura-charcoal text-aura-cream border-aura-charcoal shadow-lg'}
            `}
          >
            Agendar
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
