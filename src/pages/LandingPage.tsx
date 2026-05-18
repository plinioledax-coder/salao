import React from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import {
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Clock,
  ArrowUpRight,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import { BookingFlow } from './BookingFlow';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON (Keep for premium interaction but on sharp elements)
───────────────────────────────────────────────────────────────────────────── */
function MagneticButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  return (
    <motion.button
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARQUEE STRIP
───────────────────────────────────────────────────────────────────────────── */
function MarqueeStrip() {
  const items = ['Cabelo', 'Manicure', 'Pedicure', 'Estética Facial', 'Coloração', 'Tratamentos', 'Relaxamento'];

  return (
    <div className="py-4 overflow-hidden border-y border-editorial bg-aura-cream">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-12 text-[10px] uppercase tracking-[0.25em] text-aura-charcoal font-medium">
            {item}
            <span className="w-1 h-1 bg-aura-charcoal inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING PAGE (EDITORIAL)
───────────────────────────────────────────────────────────────────────────── */
interface LandingPageProps {
  onEnterPortal: () => void;
}

export function LandingPage({ onEnterPortal }: LandingPageProps) {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], [0, 120]);

  const navLinks = ['Início', 'Serviços', 'Sobre', 'Contato'];

  return (
    <div className="min-h-screen bg-aura-cream text-aura-charcoal font-sans">

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-aura-cream/90 backdrop-blur-md border-b border-editorial">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="text-2xl font-serif tracking-widest uppercase">
            Studio Modesto
          </div>

          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                className="text-[10px] uppercase tracking-[0.2em] hover:text-aura-gold transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>

          <button
            className="md:hidden p-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-aura-cream pt-24 px-6 md:hidden border-b border-editorial"
          >
            <div className="flex flex-col gap-8 items-center mt-10">
              {navLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-serif font-light text-aura-charcoal hover:text-aura-gold transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO EDITORIAL ────────────────────────────────────────────────── */}
      <section id="inicio" className="min-h-screen pt-20 flex flex-col">
        <div className="flex-1 max-w-[1600px] w-full mx-auto border-x border-editorial grid grid-cols-1 lg:grid-cols-12 relative">

          {/* Left Column: Massive Typography */}
          <div className="lg:col-span-7 flex flex-col justify-center px-8 lg:px-16 py-20 lg:py-0 border-b lg:border-b-0 lg:border-r border-editorial">
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[10px] uppercase tracking-[0.3em] font-medium text-aura-charcoal/50 mb-10"
            >
              Experiência Única de Beleza
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-light text-aura-charcoal leading-[0.95]"
              style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}
            >
              Realce sua <br />
              <span className="italic">essência</span> natural.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-12 text-sm font-light leading-relaxed max-w-sm text-aura-charcoal/70"
            >
              Um refúgio de tranquilidade e sofisticação onde cada detalhe é pensado para o seu bem-estar. Menos excessos, mais significado.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-16 flex flex-wrap gap-4">
              <MagneticButton
                onClick={() => setIsBookingOpen(true)}
                className="aura-button bg-aura-charcoal text-aura-cream border border-aura-charcoal hover:bg-transparent hover:text-aura-charcoal cursor-pointer transition-colors"
              >
                Agendar Horário
              </MagneticButton>
              <a
                href="https://wa.me/5571992106043?text=Ol%C3%A1!%20Vim%20pelo%20site%20Studio%20Modesto%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida."
                target="_blank"
                rel="noopener noreferrer"
                className="aura-button border border-aura-charcoal text-aura-charcoal hover:bg-aura-charcoal hover:text-aura-cream flex items-center justify-center"
              >
                Fale conosco
              </a>
            </motion.div>
          </div>

          {/* Right Column: Loose Image */}
          <div className="lg:col-span-5 relative h-[60vh] lg:h-auto overflow-hidden bg-aura-charcoal/5">
            <motion.div style={{ y: heroImageY }} className="absolute inset-0 h-[120%] -top-[10%]">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200"
                alt="Salon Interior"
                className="w-full h-full object-cover filter contrast-[1.05] grayscale-[0.2]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* ── SERVIÇOS (EDITORIAL ASYMMETRY) ────────────────────────────────── */}
      <section id="servicos" className="py-32">
        <div className="max-w-[1600px] mx-auto border-x border-editorial">

          <div className="px-8 lg:px-16 mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium mb-6 text-aura-gold">Especialidades</p>
              <h2 className="text-5xl md:text-7xl font-serif font-light leading-none">Cuidado em <br /><span className="italic">cada detalhe.</span></h2>
            </div>
          </div>

          {/* Service Items (Loose images, borders) */}
          <div className="border-t border-editorial">
            {[
              {
                title: 'Cabelo',
                desc: 'Cortes arquitetônicos, coloração precisa e tratamentos profundos para fios saudáveis.',
                img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
              },
              {
                title: 'Manicure & Pedicure',
                desc: 'Esmaltação impecável e cuidados relaxantes com produtos de alta performance.',
                img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
              },
              {
                title: 'Estética Facial',
                desc: 'Limpeza de pele e protocolos avançados para uma derme radiante e rejuvenescida.',
                img: '/facial.png',
              },
            ].map((service, i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 border-b border-editorial group">

                {/* Alternate sides for images */}
                <div className={`relative h-[50vh] lg:h-[70vh] overflow-hidden ${i % 2 !== 0 ? 'lg:order-2 lg:border-l' : 'lg:border-r'} border-editorial bg-aura-charcoal/5`}>
                  <motion.img
                    initial={{ scale: 1.05 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover grayscale-[0.3]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className={`p-8 lg:p-20 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 mb-8 block">0{i + 1}</span>
                  <h3 className="text-4xl md:text-5xl font-serif font-light italic mb-6 group-hover:text-aura-gold transition-colors duration-500">
                    {service.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed max-w-sm mb-12">
                    {service.desc}
                  </p>
                  <button onClick={() => setIsBookingOpen(true)} className="self-start text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-aura-charcoal/20 pb-1 hover:border-aura-charcoal transition-colors">
                    Agendar <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE (EDITORIAL WIREFRAME) ───────────────────────────────────── */}
      <section id="sobre" className="border-y border-editorial">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-editorial">

          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-editorial p-8 lg:p-16 flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium mb-12 text-aura-gold">A Marca</p>
              <h2 className="text-5xl lg:text-6xl font-serif font-light italic leading-none mb-8">Nossa Arte</h2>
              <p className="text-sm font-light leading-relaxed max-w-sm mb-8 text-aura-charcoal/70">
                Desde 2012 cultivamos um espaço onde técnica e estética convergem. Nossa abordagem foge de fórmulas prontas: lemos a individualidade de cada cliente para entregar resultados puros e atemporais.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-editorial">
              <div>
                <p className="text-4xl font-serif font-light mb-2">6+</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-aura-charcoal/50">Anos de expertise</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-light mb-2">2K+</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-aura-charcoal/50">Clientes atendidos</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-rows-2">
            <div className="border-b border-editorial h-[40vh] lg:h-[50vh] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=1000"
                alt="Detail"
                className="w-full h-full object-cover filter contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="h-[40vh] lg:h-[50vh] overflow-hidden">
              <img
                src="/treatment.png"
                alt="Treatment"
                className="w-full h-full object-cover filter contrast-[1.1] grayscale-[0.2]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── INVERTED CTA & FOOTER ────────────────────────────────────────── */}
      <section id="contato" className="bg-aura-charcoal text-aura-cream pt-20">
        <div className="max-w-[1600px] mx-auto border-x border-editorial-light">

          {/* CTA Drama */}
          <div className="p-8 lg:p-32 border-b border-editorial-light text-center flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-aura-gold mb-8">Experimente</p>
            <h3 className="text-5xl md:text-8xl font-serif font-light mb-16 leading-[1.1]">
              Reserve o <br /><span className="italic text-aura-gold">Incomum.</span>
            </h3>
            <MagneticButton
              onClick={() => setIsBookingOpen(true)}
              className="bg-aura-gold text-aura-charcoal px-12 py-5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors"
            >
              Agendar Horário
            </MagneticButton>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-editorial-light">
            <div className="p-8 lg:p-12">
              <h4 className="text-2xl font-serif uppercase tracking-widest mb-6">Studio Modesto</h4>
              <p className="text-xs font-light text-aura-cream/50 leading-relaxed">
                Transformando beleza em arte desde 2020.
              </p>
            </div>

            <div className="p-8 lg:p-12">
              <h5 className="text-[9px] uppercase tracking-[0.2em] font-bold mb-6 text-aura-gold">Contato</h5>
              <ul className="space-y-4 text-xs font-light text-aura-cream/70">
                <li>
                  <a href="https://wa.me/5571992106043?text=Ol%C3%A1!%20Vim%20pelo%20site%20Studio%20Modesto%20e%20gostaria%20de%20agendar%20um%20hor%C3%A1rio." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-aura-gold transition-colors">
                    <Phone className="w-3 h-3 min-w-[12px]" /> (71) 99210-6043
                  </a>
                </li>
                <li>
                  <a href="https://maps.app.goo.gl/p9b7GNvHFQV6pj157" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-aura-gold transition-colors">
                    <MapPin className="w-3 h-3 min-w-[12px] mt-0.5" /> <span>R. Duarte da Costa, 69 - Bonfim,<br />Salvador - BA</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="p-8 lg:p-12">
              <h5 className="text-[9px] uppercase tracking-[0.2em] font-bold mb-6 text-aura-gold">Horários</h5>
              <ul className="space-y-4 text-xs font-light text-aura-cream/70">
                <li className="flex items-center gap-3">
                  <Clock className="w-3 h-3 min-w-[12px]" /> Seg - Sex: 09h às 18h
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-3 min-w-[12px]"></span> Sáb: 09h às 13:00
                </li>
              </ul>
            </div>

            <div className="p-8 lg:p-12">
              <h5 className="text-[9px] uppercase tracking-[0.2em] font-bold mb-6 text-aura-gold">Social</h5>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/_studiomodesto/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-4 h-4 cursor-pointer hover:text-aura-gold transition-colors" />
                </a>
                <Facebook className="w-4 h-4 cursor-pointer hover:text-aura-gold transition-colors" />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-editorial-light text-center flex flex-col md:flex-row items-center justify-between">
            <p className="text-[9px] uppercase tracking-widest text-aura-cream/30">
              © {new Date().getFullYear()} Studio Modesto. Todos os direitos reservados.
            </p>
            <p className="text-[9px] uppercase tracking-widest text-aura-cream/30 mt-4 md:mt-0">
              Desenvolvido por <a href="https://www.apertef1.com.br" target="_blank" rel="noopener noreferrer" className="text-aura-gold hover:text-white transition-colors">Aperte F1</a>
            </p>
          </div>

        </div>
      </section>

      {/* Booking Portal Overlay */}
      <AnimatePresence>
        {isBookingOpen && <BookingFlow isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />}
      </AnimatePresence>

      <FloatingWhatsApp />
    </div>
  );
}