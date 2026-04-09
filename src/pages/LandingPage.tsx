import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Scissors,
  Heart,
  Star
} from 'lucide-react';
import { BookingFlow } from './BookingFlow';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export function LandingPage({ onEnterPortal }: LandingPageProps) {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-aura-cream selection:bg-aura-gold/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-aura-cream/80 backdrop-blur-md border-b border-aura-charcoal/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif italic text-aura-charcoal">Studio Modesto</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-aura-gold"></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#inicio" className="text-xs uppercase tracking-widest text-aura-charcoal/60 hover:text-aura-charcoal transition-colors">Início</a>
            <a href="#servicos" className="text-xs uppercase tracking-widest text-aura-charcoal/60 hover:text-aura-charcoal transition-colors">Serviços</a>
            <a href="#sobre" className="text-xs uppercase tracking-widest text-aura-charcoal/60 hover:text-aura-charcoal transition-colors">Sobre</a>
            <a href="#contato" className="text-xs uppercase tracking-widest text-aura-charcoal/60 hover:text-aura-charcoal transition-colors">Contato</a>
          </div>

          <button 
            onClick={onEnterPortal}
            className="aura-button aura-button-primary text-xs uppercase tracking-widest py-3"
          >
            Portal do Gestor
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aura-gold/10 text-aura-gold text-[10px] uppercase tracking-[0.2em] font-bold">
              <Sparkles className="w-3 h-3" />
              Experiência Única de Beleza
            </div>
            <h2 className="text-7xl md:text-8xl font-serif leading-[0.9] text-aura-charcoal italic">
              Realce sua <br />
              <span className="text-aura-sage">essência</span> natural.
            </h2>
            <p className="text-lg text-aura-charcoal/60 font-light leading-relaxed max-w-md">
              Um refúgio de tranquilidade e sofisticação onde cada detalhe é pensado para o seu bem-estar e autoestima.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="aura-button aura-button-primary px-10 py-4 text-sm uppercase tracking-widest"
              >
                Agendar Horário
              </button>
              <a href="#servicos" className="aura-button aura-button-secondary px-10 py-4 text-sm uppercase tracking-widest text-center">
                Nossos Serviços
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000" 
                alt="Salon Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 glass-card p-8 max-w-[240px] hidden md:block">
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-aura-gold text-aura-gold" />)}
              </div>
              <p className="text-sm font-serif italic mb-2">"O melhor atendimento que já tive. Ambiente impecável!"</p>
              <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">— Mariana Silva</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-aura-gold font-bold">Nossas Especialidades</p>
            <h3 className="text-5xl font-serif italic text-aura-charcoal">Cuidado em cada detalhe</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Cabelo', 
                desc: 'Cortes, coloração e tratamentos personalizados para fios saudáveis.',
                icon: Scissors,
                img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600'
              },
              { 
                title: 'Manicure & Pedicure', 
                desc: 'Esmaltação impecável e cuidados relaxantes para mãos e pés.',
                icon: Heart,
                img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600'
              },
              { 
                title: 'Estética Facial', 
                desc: 'Limpeza de pele e procedimentos para uma pele radiante e jovem.',
                icon: Sparkles,
                img: 'https://images.unsplash.com/photo-1570172619245-711f8ad1507f?auto=format&fit=crop&q=80&w=600'
              }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setIsBookingOpen(true)}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] rounded-[32px] overflow-hidden mb-6 relative">
                  <img 
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-aura-charcoal/20 group-hover:bg-aura-charcoal/40 transition-colors"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <service.icon className="w-8 h-8 mb-2" />
                    <h4 className="text-2xl font-serif italic">{service.title}</h4>
                  </div>
                </div>
                <p className="text-aura-charcoal/60 font-light leading-relaxed px-4">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-aura-charcoal text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-serif italic">Studio Modesto</h1>
            <p className="text-sm opacity-60 font-light leading-relaxed">
              Transformando beleza em arte e bem-estar em estilo de vida desde 2020.
            </p>
            <div className="flex gap-4">
              <Instagram className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Facebook className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-40">Contato</h5>
            <ul className="space-y-4 text-sm opacity-80 font-light">
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-aura-gold" /> (11) 99999-9999</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-aura-gold" /> Av. Paulista, 1000 - SP</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-40">Horários</h5>
            <ul className="space-y-4 text-sm opacity-80 font-light">
              <li className="flex items-center gap-3"><Clock className="w-4 h-4 text-aura-gold" /> Ter - Sáb: 09h às 20h</li>
              <li className="flex items-center gap-3"><Clock className="w-4 h-4 text-aura-gold" /> Dom - Seg: Fechado</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-40">Newsletter</h5>
            <div className="flex gap-2">
              <input 
                placeholder="Seu e-mail"
                className="bg-white/10 border-none rounded-full px-4 py-2 text-xs outline-none flex-1"
              />
              <button className="p-2 bg-aura-gold rounded-full text-aura-charcoal">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-[10px] uppercase tracking-widest opacity-40">
          © 2026 Studio Modesto. Todos os direitos reservados.
        </div>
      </footer>

      <AnimatePresence>
        {isBookingOpen && (
          <BookingFlow isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
