import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../utils/cn"; // Ajusta o caminho se necessário

// Importações dos nossos serviços API
import { getActiveServices } from "../services/api/services";
import { getProfessionals } from "../services/api/professionals";
import { createAppointment } from "../services/api/appointments";
import { Service, Professional } from "../types";

interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export function BookingFlow({ isOpen, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dados do banco
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  // Estado do Agendamento
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    startOfDay(addDays(new Date(), 1)),
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Carrega os dados quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          const [servicesData, profsData] = await Promise.all([
            getActiveServices(),
            getProfessionals(),
          ]);
          setServices(servicesData);
          setProfessionals(profsData);
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchInitialData();
    } else {
      // Reseta o estado quando fecha
      setStep(1);
      setSelectedService(null);
      setSelectedProf(null);
      setSelectedTime("");
      setCustomerInfo({ name: "", phone: "", email: "" });
    }
  }, [isOpen]);

  const handleBooking = async () => {
    if (
      !selectedService ||
      !selectedProf ||
      !selectedTime ||
      !customerInfo.name ||
      !customerInfo.phone
    )
      return;

    setIsSubmitting(true);
    try {
      // Combina a data selecionada com a hora
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      // Calcula o tempo de fim baseado na duração do serviço (ou 60min por defeito)
      const duration = selectedService.duration_minutes || 60;
      const endTime = new Date(startTime.getTime() + duration * 60000);

      await createAppointment({
        customer_name: customerInfo.name,
        // customer_id: null (como é público, não associamos a um utilizador registado ainda)
        professional_id: selectedProf.id,
        service_id: selectedService.id,
        service_name: selectedService.name,
        price: selectedService.price,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "scheduled",
        is_blocked: false,
      });

      setStep(5); // Ecrã de Sucesso
    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert("Houve um erro ao processar o seu agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-aura-charcoal/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="w-full max-w-4xl bg-aura-cream rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header do Modal */}
        <div className="h-20 border-b border-aura-charcoal/5 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 -ml-2 rounded-full hover:bg-aura-soft-gray text-aura-charcoal/40 hover:text-aura-charcoal transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xl font-serif italic text-aura-charcoal">
              Agendar Horário
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-aura-soft-gray text-aura-charcoal/40 hover:text-aura-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-8 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-aura-gold" />
              <p className="text-xs text-aura-charcoal/40 uppercase tracking-widest font-bold">
                A preparar o salão...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* PASSO 1: SERVIÇO */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 font-bold mb-6">
                    1. Selecione o Serviço
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                        }}
                        className={cn(
                          "flex items-start gap-4 p-6 rounded-2xl border transition-all text-left group",
                          selectedService?.id === service.id
                            ? "bg-white border-aura-gold shadow-md"
                            : "bg-white/50 border-aura-charcoal/5 hover:border-aura-gold/30 hover:bg-white",
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-colors",
                            selectedService?.id === service.id
                              ? "bg-aura-gold/10 text-aura-gold"
                              : "bg-aura-soft-gray text-aura-charcoal/40 group-hover:text-aura-gold",
                          )}
                        >
                          <Scissors className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-serif text-lg text-aura-charcoal">
                            {service.name}
                          </h5>
                          <p className="text-xs text-aura-charcoal/40 mt-1">
                            {service.duration_minutes} min
                          </p>
                        </div>
                        <p className="font-medium text-aura-charcoal text-lg">
                          R$ {Number(service.price).toFixed(2)}
                        </p>
                      </button>
                    ))}
                    {services.length === 0 && (
                      <p className="col-span-full text-center text-sm text-aura-charcoal/40 py-10">
                        Nenhum serviço disponível no momento.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PASSO 2: PROFISSIONAL */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 font-bold mb-6">
                    2. Selecione o Profissional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opção Qualquer Profissional (Pega o primeiro da lista) */}
                    <button
                      onClick={() => {
                        setSelectedProf(professionals[0]);
                        setStep(3);
                      }}
                      className="flex items-center gap-4 p-6 rounded-2xl border bg-white/50 border-aura-charcoal/5 hover:border-aura-gold/30 hover:bg-white transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20 group-hover:text-aura-gold transition-colors">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-serif text-lg text-aura-charcoal">
                          Qualquer profissional
                        </h5>
                        <p className="text-xs text-aura-charcoal/40 mt-1">
                          O primeiro disponível
                        </p>
                      </div>
                    </button>

                    {professionals.map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => {
                          setSelectedProf(prof);
                          setStep(3);
                        }}
                        className={cn(
                          "flex items-center gap-4 p-6 rounded-2xl border transition-all text-left group",
                          selectedProf?.id === prof.id
                            ? "bg-white border-aura-gold shadow-md"
                            : "bg-white/50 border-aura-charcoal/5 hover:border-aura-gold/30 hover:bg-white",
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                            selectedProf?.id === prof.id
                              ? "bg-aura-gold/10 text-aura-gold"
                              : "bg-aura-soft-gray text-aura-charcoal/20 group-hover:text-aura-gold",
                          )}
                        >
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg text-aura-charcoal">
                            {prof.name}
                          </h5>
                          <p className="text-xs text-aura-charcoal/40 mt-1">
                            {prof.role}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PASSO 3: DATA E HORA */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 font-bold">
                    3. Data e Horário
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Seleção de Data Simples (Pode evoluir para um calendário real depois) */}
                    <div className="space-y-4">
                      <p className="text-xs font-medium text-aura-charcoal/60 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Dias Disponíveis
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => {
                          const date = addDays(new Date(), i + 1);
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedDate(startOfDay(date))}
                              className={cn(
                                "p-3 rounded-xl border text-center transition-all",
                                isSameDay(selectedDate, date)
                                  ? "bg-aura-charcoal text-white border-aura-charcoal shadow-md"
                                  : "bg-white border-aura-charcoal/5 hover:border-aura-gold/30",
                              )}
                            >
                              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
                                {format(date, "EEE", { locale: ptBR })}
                              </p>
                              <p className="font-serif text-lg">
                                {format(date, "d")}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-medium text-aura-charcoal/60 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Horários
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                              selectedTime === time
                                ? "bg-aura-gold text-white border-aura-gold shadow-md"
                                : "bg-white border-aura-charcoal/5 hover:border-aura-gold/30",
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      onClick={() => setStep(4)}
                      disabled={!selectedTime}
                      className="aura-button aura-button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PASSO 4: SEUS DADOS */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-aura-charcoal/40 font-bold">
                    4. Confirme os seus dados
                  </h4>

                  <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50">
                    <div className="space-y-1">
                      <p className="font-serif text-lg">
                        {selectedService?.name}
                      </p>
                      <p className="text-xs text-aura-charcoal/60">
                        com {selectedProf?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}{" "}
                        às {selectedTime}
                      </p>
                      <p className="text-aura-sage font-bold mt-1">
                        R$ {Number(selectedService?.price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleBooking();
                    }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                        Nome Completo
                      </label>
                      <input
                        required
                        className="w-full bg-white border border-aura-charcoal/5 rounded-xl px-4 py-3 outline-none focus:border-aura-gold/50 transition-colors"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                          Telefone / WhatsApp
                        </label>
                        <input
                          required
                          className="w-full bg-white border border-aura-charcoal/5 rounded-xl px-4 py-3 outline-none focus:border-aura-gold/50 transition-colors"
                          value={customerInfo.phone}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                          E-mail (Opcional)
                        </label>
                        <input
                          type="email"
                          className="w-full bg-white border border-aura-charcoal/5 rounded-xl px-4 py-3 outline-none focus:border-aura-gold/50 transition-colors"
                          value={customerInfo.email}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !customerInfo.name ||
                          !customerInfo.phone
                        }
                        className="aura-button aura-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Confirmar Agendamento"
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PASSO 5: SUCESSO */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-12"
                >
                  <div className="w-24 h-24 bg-aura-sage/10 rounded-full flex items-center justify-center mx-auto text-aura-sage">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-3xl font-serif italic text-aura-charcoal">
                      Tudo pronto!
                    </h4>
                    <p className="text-aura-charcoal/60 max-w-sm mx-auto">
                      O seu horário foi reservado com sucesso no Studio Modesto.
                      Estamos ansiosos para recebê-lo(a).
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="aura-button aura-button-primary px-12"
                  >
                    Voltar ao Site
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
