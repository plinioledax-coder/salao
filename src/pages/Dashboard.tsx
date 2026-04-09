import React, { useState, useEffect, useRef } from "react";
import { getDashboardData } from "../services/api/dashboard";
import { Appointment, Customer } from "../types";
import { cn } from "../utils/cn";
import {
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  AlertCircle,
  Star,
  Cake,
  Clock,
  ChevronRight,
  Loader2,
  X,
  MessageCircle,
  Gift,
  Package,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DrawerType =
  | "appointments"
  | "newCustomers"
  | "stockAlerts"
  | "professional"
  | "birthday"
  | null;

type DateFilter = "today" | "week" | "month" | "custom";

interface StockAlert {
  id: string;
  product: string;
  current: number;
  minimum: number;
  unit: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

// ---------------------------------------------------------------------------
// Mock extra data (substitua por chamadas reais ao Supabase)
// ---------------------------------------------------------------------------
const MOCK_STOCK_ALERTS: StockAlert[] = [
  { id: "1", product: "Tintura Louro 9.0", current: 2, minimum: 10, unit: "un" },
  { id: "2", product: "Shampoo Profissional 1L", current: 1, minimum: 5, unit: "un" },
  { id: "3", product: "Água Oxigenada 30vol", current: 3, minimum: 12, unit: "un" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getDateRange(filter: DateFilter): DateRange {
  const now = new Date();
  switch (filter) {
    case "today":
      return { from: now, to: now };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case "month":
      return { from: startOfMonth(now), to: now };
    default:
      return { from: subDays(now, 30), to: now };
  }
}

function filterLabel(filter: DateFilter): string {
  return (
    { today: "Hoje", week: "Esta semana", month: "Este mês", custom: "Personalizado" }[
      filter
    ] ?? "Hoje"
  );
}

// ---------------------------------------------------------------------------
// Drawer component
// ---------------------------------------------------------------------------
function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-aura-charcoal/5">
              <h2 className="font-serif text-xl">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-aura-soft-gray transition-colors text-aura-charcoal/40 hover:text-aura-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Date Filter Dropdown
// ---------------------------------------------------------------------------
function DateFilterButton({
  value,
  onChange,
}: {
  value: DateFilter;
  onChange: (v: DateFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options: DateFilter[] = ["today", "week", "month"];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-aura-soft-gray text-aura-charcoal/70 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-aura-gold/10 hover:text-aura-gold transition-all"
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        {filterLabel(value)}
        <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border border-aura-charcoal/5 overflow-hidden z-10 min-w-[160px]"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm hover:bg-aura-soft-gray transition-colors",
                  value === opt
                    ? "text-aura-gold font-semibold bg-aura-gold/5"
                    : "text-aura-charcoal/70"
                )}
              >
                {filterLabel(opt)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [birthdays, setBirthdays] = useState<Customer[]>([]);
  const [newCustomers, setNewCustomers] = useState<Customer[]>([]);

  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [selectedBirthday, setSelectedBirthday] = useState<Customer | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");

  // Stats (ainda mockados — substituir por agregações reais)
  const [stats] = useState({
    revenue: 12450,
    appointments: 42,
    newCustomers: 12,
    stockAlerts: MOCK_STOCK_ALERTS.length,
  });

  const topProfessional = {
    name: "Ana Silva",
    role: "Cabelereira",
    rating: 4.9,
    appointments: 28,
    revenue: 6800,
    // Critério: maior faturamento gerado no período
  };

  const chartData = [
    { name: "Seg", value: 400 },
    { name: "Ter", value: 300 },
    { name: "Qua", value: 600 },
    { name: "Qui", value: 800 },
    { name: "Sex", value: 500 },
    { name: "Sáb", value: 900 },
    { name: "Dom", value: 200 },
  ];

  const cards = [
    {
      label: "Receita Mensal",
      value: `R$ ${stats.revenue.toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      trend: "+12%",
      color: "text-aura-sage",
      drawer: null as DrawerType, // Receita pode ter próprio drawer futuramente
      description: "Total faturado no período selecionado",
    },
    {
      label: "Agendamentos",
      value: stats.appointments,
      icon: CalendarIcon,
      trend: "+5%",
      color: "text-aura-gold",
      drawer: "appointments" as DrawerType,
      description: "Agendamentos pendentes (não concluídos)",
    },
    {
      label: "Novos Clientes",
      value: stats.newCustomers,
      icon: Users,
      trend: "+18%",
      color: "text-aura-clay",
      drawer: "newCustomers" as DrawerType,
      description: "Cadastrados nos últimos 30 dias",
    },
    {
      label: "Alertas de Estoque",
      value: stats.stockAlerts,
      icon: AlertCircle,
      trend: "Crítico",
      color: "text-red-500",
      drawer: "stockAlerts" as DrawerType,
      description: "Produtos abaixo do estoque mínimo",
    },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setUpcomingAppointments(data.todayAppointments);
        setBirthdays(data.birthdays);
        // setNewCustomers(data.newCustomers); // quando disponível na API
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [dateFilter]);

  const openDrawer = (type: DrawerType) => {
    if (!type) return;
    setDrawerType(type);
  };

  const handleBirthdayAction = (customer: Customer) => {
    setSelectedBirthday(customer);
    setDrawerType("birthday");
  };

  const whatsappLink = (phone: string, name: string) => {
    const msg = encodeURIComponent(
      `Olá ${name}! 🎂 A equipe do salão deseja um feliz aniversário! Como presente especial, você ganhou um cupom de 15% de desconto no seu próximo agendamento. Use o código: ANIVER15 💛`
    );
    return `https://wa.me/55${phone.replace(/\D/g, "")}?text=${msg}`;
  };

  // ---------------------------------------------------------------------------
  // Drawer content renderers
  // ---------------------------------------------------------------------------
  const renderDrawerContent = () => {
    switch (drawerType) {
      // ---- Agendamentos ----
      case "appointments":
        return (
          <div className="space-y-3">
            <p className="text-xs text-aura-charcoal/40 uppercase tracking-widest font-semibold mb-4">
              Agendamentos não concluídos · {filterLabel(dateFilter)}
            </p>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12 text-aura-charcoal/30">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum agendamento pendente</p>
              </div>
            ) : (
              upcomingAppointments
                .filter((a) => a.status !== "concluido")
                .map((appt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl border border-aura-charcoal/5 hover:border-aura-gold/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-serif text-base">{appt.customer_name}</p>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                          appt.status === "confirmado"
                            ? "bg-green-100 text-green-700"
                            : appt.status === "pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-aura-soft-gray text-aura-charcoal/50"
                        )}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-aura-charcoal/40">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {format(new Date(appt.start_time), "HH:mm · dd/MM")}
                      </span>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        );

      // ---- Novos Clientes ----
      case "newCustomers":
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-aura-gold/5 border border-aura-gold/10 mb-6">
              <p className="text-xs text-aura-charcoal/60 leading-relaxed">
                <strong className="text-aura-charcoal">O que é um novo cliente?</strong>
                <br />
                Clientes cujo cadastro foi criado nos{" "}
                <strong>últimos 30 dias</strong>. Independente de já terem
                agendado ou não.
              </p>
            </div>
            <p className="text-xs text-aura-charcoal/40 uppercase tracking-widest font-semibold">
              {stats.newCustomers} novos clientes · últimos 30 dias
            </p>
            {/* Quando a API retornar newCustomers, mapear aqui */}
            {newCustomers.length === 0 ? (
              <div className="space-y-3 mt-4">
                {/* Placeholder visual enquanto API não retorna */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-aura-charcoal/5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-aura-soft-gray rounded-full w-32 mb-2" />
                      <div className="h-2 bg-aura-soft-gray rounded-full w-20" />
                    </div>
                  </div>
                ))}
                <p className="text-center text-xs text-aura-charcoal/30 pt-2">
                  Conecte a query de novos clientes na API para ver os dados reais
                </p>
              </div>
            ) : (
              newCustomers.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl border border-aura-charcoal/5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-aura-charcoal/40">
                      {/* c.created_at ? format(new Date(c.created_at), "dd 'de' MMMM", { locale: ptBR }) : "" */}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        );

      // ---- Alertas de Estoque ----
      case "stockAlerts":
        return (
          <div className="space-y-3">
            <p className="text-xs text-aura-charcoal/40 uppercase tracking-widest font-semibold mb-4">
              {MOCK_STOCK_ALERTS.length} produtos em estado crítico
            </p>
            {MOCK_STOCK_ALERTS.map((item, i) => {
              const pct = Math.round((item.current / item.minimum) * 100);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-2xl border border-red-100 bg-red-50/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-100 text-red-500">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.product}</p>
                        <p className="text-xs text-aura-charcoal/40">
                          Mínimo: {item.minimum} {item.unit}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-serif text-red-500 font-bold">
                      {item.current}
                      <span className="text-xs font-sans text-red-400 ml-1">
                        {item.unit}
                      </span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-red-400 mt-1 text-right">
                    {pct}% do mínimo
                  </p>
                </motion.div>
              );
            })}
            <button className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-aura-charcoal/10 text-xs text-aura-charcoal/40 hover:border-aura-gold/30 hover:text-aura-gold transition-all font-semibold uppercase tracking-widest">
              Ir para Estoque Completo
            </button>
          </div>
        );

      // ---- Profissional da semana ----
      case "professional":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-aura-charcoal text-white">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-aura-gold">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="font-serif text-xl">{topProfessional.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-aura-gold mt-0.5">
                  {topProfessional.role}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-aura-gold/5 border border-aura-gold/10">
              <p className="text-xs text-aura-charcoal/60 leading-relaxed">
                <strong className="text-aura-charcoal">Como é definido?</strong>
                <br />O profissional com <strong>maior faturamento gerado</strong>{" "}
                no período selecionado. Serviços concluídos e pagos contam.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Faturamento", value: `R$ ${topProfessional.revenue.toLocaleString("pt-BR")}`, icon: TrendingUp },
                { label: "Atendimentos", value: topProfessional.appointments, icon: CheckCircle2 },
                { label: "Avaliação", value: `${topProfessional.rating} ★`, icon: Star },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl border border-aura-charcoal/5 text-center"
                >
                  <stat.icon className="w-4 h-4 text-aura-gold mx-auto mb-2" />
                  <p className="font-serif text-lg">{stat.value}</p>
                  <p className="text-[10px] text-aura-charcoal/40 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      // ---- Birthday action ----
      case "birthday":
        if (!selectedBirthday) return null;
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-aura-clay/5 border border-aura-clay/10">
              <div className="w-14 h-14 rounded-full bg-aura-clay/10 flex items-center justify-center text-aura-clay">
                <Cake className="w-7 h-7" />
              </div>
              <div>
                <p className="font-serif text-lg">{selectedBirthday.name}</p>
                <p className="text-xs text-aura-charcoal/40">Aniversariante</p>
              </div>
            </div>

            <p className="text-xs text-aura-charcoal/50 leading-relaxed">
              Envie uma mensagem de parabéns com um cupom de desconto. O link
              vai abrir o WhatsApp com a mensagem pronta — é só enviar!
            </p>

            {/* Cupom preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-aura-gold/10 to-aura-clay/10 border border-aura-gold/20">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-aura-gold" />
                <span className="text-xs font-bold text-aura-gold uppercase tracking-widest">
                  Cupom gerado
                </span>
              </div>
              <p className="font-serif text-2xl">ANIVER15</p>
              <p className="text-xs text-aura-charcoal/50">15% de desconto · próximo agendamento</p>
            </div>

            <a
              href={whatsappLink(
                (selectedBirthday as any).phone ?? "00000000000",
                selectedBirthday.name
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20b857] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar parabéns no WhatsApp
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  const drawerTitles: Record<NonNullable<DrawerType>, string> = {
    appointments: "Agendamentos Pendentes",
    newCustomers: "Novos Clientes",
    stockAlerts: "Alertas de Estoque",
    professional: "Profissional da Semana",
    birthday: `Parabéns, ${selectedBirthday?.name?.split(" ")[0] ?? ""}! 🎂`,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-aura-gold" />
      </div>
    );
  }

  return (
    <>
      {/* ---- Drawer ---- */}
      <Drawer
        open={!!drawerType}
        onClose={() => {
          setDrawerType(null);
          setSelectedBirthday(null);
        }}
        title={drawerType ? drawerTitles[drawerType] : ""}
      >
        {renderDrawerContent()}
      </Drawer>

      <div className="space-y-10">
        {/* ---- Header com filtro de data ---- */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl">Dashboard</h2>
            <p className="text-xs text-aura-charcoal/40 mt-1">
              Exibindo dados de{" "}
              <span className="text-aura-gold font-semibold">
                {filterLabel(dateFilter).toLowerCase()}
              </span>
            </p>
          </div>
          <DateFilterButton value={dateFilter} onChange={setDateFilter} />
        </div>

        {/* ---- Stats Grid ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => openDrawer(card.drawer)}
              className={cn(
                "glass-card p-6 flex flex-col justify-between",
                card.drawer
                  ? "cursor-pointer hover:ring-2 hover:ring-aura-gold/20 hover:shadow-lg transition-all group"
                  : ""
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-2xl bg-aura-soft-gray ${card.color} ${
                    card.drawer ? "group-hover:scale-110 transition-transform" : ""
                  }`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full",
                    card.trend.startsWith("+")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {card.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-aura-charcoal/40 text-xs uppercase tracking-widest">
                  {card.label}
                </p>
                <p className="text-2xl font-serif mt-1">{card.value}</p>
                {card.drawer && (
                  <p className="text-[10px] text-aura-gold/70 mt-2 flex items-center gap-1 group-hover:text-aura-gold transition-colors">
                    Ver detalhes <ChevronRight className="w-3 h-3" />
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---- Chart ---- */}
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-serif">Fluxo de Receita</h3>
              <select className="bg-aura-soft-gray border-none rounded-lg text-xs px-3 py-1 outline-none">
                <option>Últimos 7 dias</option>
                <option>Último mês</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <div style={{ width: "100%", height: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#999" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#999" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#D4AF37"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ---- Side Panels ---- */}
          <div className="space-y-8">
            {/* Top Professional — CLICÁVEL, cor corrigida */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => openDrawer("professional")}
              className="glass-card p-6 bg-aura-charcoal cursor-pointer hover:ring-2 hover:ring-aura-gold/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-serif italic text-aura-gold">
                  Profissional da Semana
                </h4>
                <Star className="w-4 h-4 text-aura-gold fill-aura-gold" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-aura-gold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  {/* ✅ Cor corrigida: era branco em branco */}
                  <p className="font-medium text-white">{topProfessional.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">
                    {topProfessional.role}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-lg font-serif text-aura-gold">
                    {topProfessional.rating}
                  </p>
                  <p className="text-[10px] text-white/50">
                    {topProfessional.appointments} atend.
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-aura-gold/60 mt-4 text-right flex items-center justify-end gap-1 group-hover:text-aura-gold transition-colors">
                Ver detalhes <ChevronRight className="w-3 h-3" />
              </p>
            </motion.div>

            {/* Birthdays — CLICÁVEL por item */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-serif italic">Aniversariantes</h4>
                <Cake className="w-4 h-4 text-aura-clay" />
              </div>
              <div className="space-y-4">
                {birthdays.length > 0 ? (
                  birthdays.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => handleBirthdayAction(b)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/30">
                          <Users className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-medium group-hover:text-aura-gold transition-colors">
                          {b.name}
                        </p>
                      </div>
                      <button className="p-1.5 rounded-full bg-aura-soft-gray text-aura-charcoal/40 hover:bg-[#25D366]/10 hover:text-[#25D366] transition-all flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-aura-charcoal/40 text-center py-2">
                    Nenhum aniversariante hoje.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Upcoming Appointments ---- */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-serif">Próximos Agendamentos de Hoje</h3>
            <button className="text-xs uppercase tracking-widest text-aura-gold font-bold hover:underline">
              Ver Agenda Completa
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-aura-charcoal/5 hover:border-aura-gold/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-aura-gold">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {format(new Date(appt.start_time), "HH:mm")}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-aura-soft-gray text-aura-charcoal/60 uppercase font-bold">
                      {appt.status}
                    </span>
                  </div>
                  <p className="font-serif text-lg mb-1">{appt.customer_name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-aura-charcoal/40">Serviço Agendado</p>
                    <div className="w-6 h-6 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20">
                      <Users className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-aura-charcoal/30">
                Nenhum agendamento para hoje. Aproveite para organizar o salão! ✨
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}