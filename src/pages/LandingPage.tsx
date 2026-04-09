import React from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
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
  Star,
  ArrowUpRight,
  Play,
} from 'lucide-react';
import { BookingFlow } from './BookingFlow';

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED MESH GRADIENT BACKGROUND
───────────────────────────────────────────────────────────────────────────── */
function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'blur(60px)', opacity: 0.55 }}
      >
        <defs>
          <radialGradient id="g1" cx="20%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g2" cx="80%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#8FAF8E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8FAF8E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g3" cx="50%" cy="90%" r="50%">
            <stop offset="0%" stopColor="#E8D5C0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E8D5C0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.ellipse
          cx="20%" cy="20%" rx="40%" ry="40%"
          fill="url(#g1)"
          animate={{ cx: ['20%', '25%', '18%', '20%'], cy: ['20%', '28%', '15%', '20%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="80%" cy="60%" rx="45%" ry="45%"
          fill="url(#g2)"
          animate={{ cx: ['80%', '72%', '85%', '80%'], cy: ['60%', '68%', '55%', '60%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.ellipse
          cx="50%" cy="90%" rx="40%" ry="35%"
          fill="url(#g3)"
          animate={{ cx: ['50%', '58%', '44%', '50%'], cy: ['90%', '85%', '92%', '90%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </svg>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON
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
   FLOATING STATS CARD
───────────────────────────────────────────────────────────────────────────── */
function StatsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute -top-8 -right-8 z-10 hidden lg:block"
    >
      <div
        className="rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,169,110,0.25)',
          minWidth: 180,
        }}
      >
        <p className="text-[9px] uppercase tracking-[0.25em] text-aura-charcoal/40 mb-3">Avaliação</p>
        <div className="flex gap-0.5 mb-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-3.5 h-3.5 fill-aura-gold text-aura-gold" />
          ))}
        </div>
        <p className="text-3xl font-serif italic text-aura-charcoal">4.9</p>
        <p className="text-[10px] text-aura-charcoal/40 mt-1">+320 avaliações</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TESTIMONIAL CARD (hero bottom-left)
───────────────────────────────────────────────────────────────────────────── */
function TestimonialCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute -bottom-8 -left-8 z-10 hidden md:block max-w-[250px]"
    >
      <div
        className="rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(143,175,142,0.2)',
        }}
      >
        <div className="flex gap-0.5 mb-3">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-3 h-3 fill-aura-gold text-aura-gold" />
          ))}
        </div>
        <p className="text-sm font-serif italic text-aura-charcoal leading-snug mb-3">
          "O melhor atendimento que já tive. Ambiente impecável!"
        </p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-aura-sage/30 flex items-center justify-center text-[9px] font-bold text-aura-sage">
            M
          </div>
          <p className="text-[9px] uppercase tracking-widest text-aura-charcoal/40">Mariana Silva</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SERVICE CARD
───────────────────────────────────────────────────────────────────────────── */
function ServiceCard({
  service,
  index,
  onBook,
}: {
  service: { title: string; desc: string; icon: React.ElementType; img: string; tag: string };
  index: number;
  onBook: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onBook}
      className="group cursor-pointer relative"
    >
      {/* Image container */}
      <div className="aspect-[3/4] rounded-[32px] overflow-hidden mb-6 relative shadow-xl">
        <motion.img
          src={service.img}
          alt={service.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          referrerPolicy="no-referrer"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to top, rgba(42,38,33,0.85) 0%, rgba(42,38,33,0.1) 55%, transparent 100%)',
            opacity: hovered ? 1 : 0.7,
          }}
        />

        {/* Tag top-left */}
        <div className="absolute top-5 left-5">
          <span
            className="text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {service.tag}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-7">
          <service.icon className="w-7 h-7 mb-3 text-aura-gold" />
          <h4 className="text-2xl font-serif italic text-white mb-2">{service.title}</h4>

          {/* CTA arrow - slides up on hover */}
          <motion.div
            className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.3 }}
          >
            Agendar agora
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </div>

      <p className="text-aura-charcoal/55 font-light leading-relaxed px-2 text-[15px]">
        {service.desc}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARQUEE STRIP
───────────────────────────────────────────────────────────────────────────── */
function MarqueeStrip() {
  const items = ['Cabelo', 'Manicure', 'Pedicure', 'Estética Facial', 'Coloração', 'Tratamentos', 'Relaxamento'];

  return (
    <div className="py-5 overflow-hidden border-y border-aura-charcoal/8 bg-aura-gold/5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-aura-charcoal/40 font-bold">
            {item}
            <span className="w-1 h-1 rounded-full bg-aura-gold inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ABOUT / STATS SECTION
───────────────────────────────────────────────────────────────────────────── */
function AboutSection() {
  const stats = [
    { value: '6+', label: 'Anos de experiência' },
    { value: '2K+', label: 'Clientes satisfeitas' },
    { value: '98%', label: 'Índice de retorno' },
    { value: '12', label: 'Profissionais especializadas' },
  ];

  return (
    <section id="sobre" className="py-32 px-6 relative overflow-hidden">
      <MeshBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-aura-gold font-bold">Nossa História</p>
            <h3 className="text-5xl md:text-6xl font-serif italic text-aura-charcoal leading-[1.05]">
              Beleza que <br />
              <span className="text-aura-sage">transforma</span>.
            </h3>
            <p className="text-base text-aura-charcoal/55 font-light leading-relaxed max-w-md">
              Desde 2020 cultivamos um espaço onde técnica e acolhimento se encontram. Cada visita é uma experiência sensorial cuidadosamente desenhada para você sair transformada — por dentro e por fora.
            </p>
            <p className="text-base text-aura-charcoal/55 font-light leading-relaxed max-w-md">
              Utilizamos produtos premium, técnicas atualizadas e, acima de tudo, escuta ativa para entregar resultados que superam expectativas.
            </p>
          </motion.div>

          {/* Right: image mosaic */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-[3/4] rounded-[28px] overflow-hidden row-span-2 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
                alt="Studio"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="aspect-square rounded-[28px] overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400"
                alt="Detail"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="aspect-square rounded-[28px] overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1631730359585-a4a4e1a2ee06?auto=format&fit=crop&q=80&w=400"
                alt="Treatment"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[24px] p-8"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(201,169,110,0.15)',
              }}
            >
              <p className="text-4xl font-serif italic text-aura-charcoal mb-2">{s.value}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 font-bold">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────────────────────────── */
interface LandingPageProps {
  onEnterPortal: () => void;
}

export function LandingPage({ onEnterPortal }: LandingPageProps) {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 600], [0, 80]);
  const heroTextY = useTransform(scrollY, [0, 400], [0, -40]);

  return (
    <div className="min-h-screen bg-aura-cream selection:bg-aura-gold/30">

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50"
        style={{
          background: 'rgba(248,243,236,0.75)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(42,38,33,0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <h1 className="text-3xl font-serif italic text-aura-charcoal">Studio Modesto</h1>
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-aura-gold"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          <div className="hidden md:flex items-center gap-10">
            {['Início', 'Serviços', 'Sobre', 'Contato'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                className="relative text-[10px] uppercase tracking-widest text-aura-charcoal/50 hover:text-aura-charcoal transition-colors duration-300 group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-aura-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <MagneticButton
            onClick={onEnterPortal}
            className="aura-button aura-button-primary text-[10px] uppercase tracking-widest py-3 px-6"
          >
            Portal do Gestor
          </MagneticButton>
        </div>
      </motion.nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated mesh background */}
        <MeshBackground />

        {/* Decorative ring */}
        <div
          className="absolute -right-64 -top-64 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(201,169,110,0.12)',
            boxShadow: 'inset 0 0 80px rgba(201,169,110,0.05)',
          }}
        />
        <div
          className="absolute -right-40 -top-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ border: '1px solid rgba(201,169,110,0.08)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left: copy */}
            <motion.div style={{ y: heroTextY }} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-aura-gold"
                style={{
                  background: 'rgba(201,169,110,0.1)',
                  border: '1px solid rgba(201,169,110,0.2)',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
                Experiência Única de Beleza
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif italic text-aura-charcoal"
                style={{ fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', lineHeight: 0.92 }}
              >
                Realce sua
                <br />
                <span className="relative inline-block text-aura-sage">
                  essência
                  {/* Underline decoration */}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12" fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.path
                      d="M2 8 Q50 2 100 8 Q150 14 198 8"
                      stroke="#8FAF8E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </motion.svg>
                </span>{' '}
                natural.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg text-aura-charcoal/55 font-light leading-relaxed max-w-md"
              >
                Um refúgio de tranquilidade e sofisticação onde cada detalhe é pensado para o seu bem-estar e autoestima.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <MagneticButton
                  onClick={() => setIsBookingOpen(true)}
                  className="aura-button aura-button-primary px-10 py-4 text-[11px] uppercase tracking-widest"
                >
                  Agendar Horário
                </MagneticButton>

                <motion.a
                  href="#servicos"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 text-[11px] uppercase tracking-widest rounded-full text-aura-charcoal/70 hover:text-aura-charcoal transition-colors duration-300"
                  style={{ border: '1px solid rgba(42,38,33,0.15)' }}
                  whileHover={{ borderColor: 'rgba(201,169,110,0.5)', scale: 1.02 }}
                >
                  <Play className="w-3 h-3 fill-aura-charcoal/60" />
                  Ver Serviços
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Right: hero image with parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <StatsCard />

              <motion.div
                style={{ y: heroImageY }}
                className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000"
                  alt="Salon Interior"
                  className="w-full h-full object-cover scale-110"
                  referrerPolicy="no-referrer"
                />
                {/* Subtle vignette */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 60%, rgba(42,38,33,0.2) 100%)',
                  }}
                />
              </motion.div>

              <TestimonialCard />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-[9px] uppercase tracking-[0.3em] text-aura-charcoal/30">Scroll</p>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-aura-charcoal/30 to-transparent"
            animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-32 relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(248,243,236,0.3) 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex items-end justify-between mb-20"
          >
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-aura-gold font-bold">Nossas Especialidades</p>
              <h3 className="text-5xl md:text-6xl font-serif italic text-aura-charcoal leading-[1.05]">
                Cuidado em cada <br />detalhe.
              </h3>
            </div>
            <motion.button
              onClick={() => setIsBookingOpen(true)}
              className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-widest text-aura-charcoal/50 hover:text-aura-charcoal transition-colors duration-300 group"
              whileHover={{ x: 4 }}
            >
              Ver todos
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Cabelo',
                desc: 'Cortes, coloração e tratamentos personalizados para fios saudáveis e cheios de vida.',
                icon: Scissors,
                img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
                tag: 'Mais popular',
              },
              {
                title: 'Manicure & Pedicure',
                desc: 'Esmaltação impecável e cuidados relaxantes para mãos e pés com produtos premium.',
                icon: Heart,
                img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600',
                tag: 'Exclusivo',
              },
              {
                title: 'Estética Facial',
                desc: 'Limpeza de pele e procedimentos avançados para uma pele radiante e jovem.',
                icon: Sparkles,
                img: 'https://images.unsplash.com/photo-1570172619245-711f8ad1507f?auto=format&fit=crop&q=80&w=600',
                tag: 'Novidade',
              },
            ].map((service, i) => (
              <ServiceCard key={i} service={service} index={i} onBook={() => setIsBookingOpen(true)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT + STATS ────────────────────────────────────────────────── */}
      <AboutSection />

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[40px] overflow-hidden p-16 text-center"
            style={{ background: 'linear-gradient(135deg, #2A2621 0%, #3d3730 50%, #2A2621 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #8FAF8E 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

            <div className="relative z-10 space-y-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-aura-gold font-bold">Pronta para se transformar?</p>
              <h3 className="text-4xl md:text-5xl font-serif italic text-white">
                Reserve seu horário hoje.
              </h3>
              <p className="text-white/50 font-light max-w-md mx-auto">
                Consulta gratuita de 15 minutos para novos clientes. Agende agora e ganhe 10% de desconto na primeira visita.
              </p>
              <MagneticButton
                onClick={() => setIsBookingOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-aura-gold text-aura-charcoal px-10 py-4 rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-aura-gold/90 transition-colors"
              >
                Agendar Agora
                <ArrowUpRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer id="contato" className="bg-aura-charcoal text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
            <div className="space-y-6">
              <h1 className="text-4xl font-serif italic">Studio Modesto</h1>
              <p className="text-sm opacity-50 font-light leading-relaxed">
                Transformando beleza em arte e bem-estar em estilo de vida desde 2020.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook].map((Icon, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.15, y: -2 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Icon className="w-4 h-4 opacity-70" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-30">Contato</h5>
              <ul className="space-y-4 text-sm font-light">
                <li className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <Phone className="w-4 h-4 text-aura-gold flex-shrink-0" />
                  (11) 99999-9999
                </li>
                <li className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <MapPin className="w-4 h-4 text-aura-gold flex-shrink-0" />
                  Av. Paulista, 1000 — SP
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-30">Horários</h5>
              <ul className="space-y-4 text-sm font-light">
                <li className="flex items-center gap-3 opacity-60">
                  <Clock className="w-4 h-4 text-aura-gold flex-shrink-0" />
                  Ter — Sáb: 09h às 20h
                </li>
                <li className="flex items-center gap-3 opacity-60">
                  <Clock className="w-4 h-4 text-aura-gold flex-shrink-0" />
                  Dom — Seg: Fechado
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-30">Newsletter</h5>
              <p className="text-sm opacity-50 font-light">Receba novidades e promoções exclusivas.</p>
              <div
                className="flex items-center gap-2 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <input
                  placeholder="Seu e-mail"
                  className="bg-transparent text-xs outline-none flex-1 px-3 placeholder:text-white/30 text-white/80"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="p-2.5 bg-aura-gold rounded-full text-aura-charcoal flex-shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </div>

          <div
            className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-[9px] uppercase tracking-widest opacity-30">
              © 2026 Studio Modesto. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              {['Privacidade', 'Termos', 'Cookies'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[9px] uppercase tracking-widest opacity-25 hover:opacity-60 transition-opacity"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── BOOKING MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBookingOpen && (
          <BookingFlow isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}