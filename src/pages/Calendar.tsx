import React, { useState, useEffect, useCallback } from 'react';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../services/api/appointments';
import { getProfessionals } from '../services/api/professionals';
import { Appointment, Professional, AppointmentStatus } from '../types';
import { cn } from '../utils/cn';
import { 
  Plus, ChevronLeft, ChevronRight, Scissors, Ban, Loader2, 
  Calendar as CalendarIcon, Clock, User, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedProf, setSelectedProf] = useState<string>('all');
  
  const [newAppt, setNewAppt] = useState({
    customer_name: '',
    service_name: '',
    professional_id: '',
    start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    price: 0,
    is_blocked: false,
    status: 'scheduled' as AppointmentStatus
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Define o intervalo de busca baseado na visualização (Dia ou Semana)
      const start = viewMode === 'week' ? startOfWeek(currentDate, { weekStartsOn: 0 }) : startOfDay(currentDate);
      const end = viewMode === 'week' ? addDays(start, 7) : endOfDay(currentDate);
      
      const [apptData, profData] = await Promise.all([
        getAppointments(start, end),
        getProfessionals()
      ]);
      
      setAppointments(apptData);
      setProfessionals(profData);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const start = new Date(newAppt.start_time);
      // Duração padrão de 60 min para o end_time
      const end = new Date(start.getTime() + 60 * 60000);

      await createAppointment({
        ...newAppt,
        customer_name: newAppt.is_blocked ? 'HORÁRIO BLOQUEADO' : newAppt.customer_name,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: newAppt.is_blocked ? 'blocked' : 'scheduled'
      });
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert("Erro ao realizar agendamento.");
    }
  };

  const handleStatusUpdate = async (appt: Appointment, newStatus: AppointmentStatus) => {
    try {
      // Passamos o objeto 'appt' completo para que o serviço consiga 
      // ler o preço e o cliente para gerar o financeiro/pontos
      await updateAppointmentStatus(appt.id, newStatus, appt);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const resetForm = () => {
    setNewAppt({
      customer_name: '',
      service_name: '',
      professional_id: '',
      start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      price: 0,
      is_blocked: false,
      status: 'scheduled' as AppointmentStatus
    });
  };

  const weekDays = viewMode === 'week' 
    ? Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), i))
    : [currentDate];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-aura-sage" />;
      case 'cancelled': return <XCircle className="w-3 h-3 text-red-400" />;
      case 'blocked': return <Ban className="w-3 h-3 text-aura-charcoal/40" />;
      default: return <Clock className="w-3 h-3 text-aura-gold" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-aura-sage bg-aura-sage/5 opacity-80';
      case 'cancelled': return 'border-l-red-400 bg-red-50 grayscale';
      case 'blocked': return 'border-l-aura-charcoal bg-aura-soft-gray border-dashed';
      default: return 'border-l-aura-gold bg-white shadow-sm';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header da Agenda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 p-6 rounded-3xl border border-aura-charcoal/5">
        <div className="flex items-center gap-6">
          <div className="flex bg-aura-soft-gray rounded-full p-1">
            <button 
              onClick={() => setViewMode('day')} 
              className={cn("px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all", viewMode === 'day' ? "bg-aura-charcoal text-white shadow-md" : "text-aura-charcoal/40 hover:text-aura-charcoal")}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode('week')} 
              className={cn("px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all", viewMode === 'week' ? "bg-aura-charcoal text-white shadow-md" : "text-aura-charcoal/40 hover:text-aura-charcoal")}
            >
              Semana
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1))} 
              className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-aura-charcoal/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-serif italic min-w-[200px] text-center">
              {format(currentDate, viewMode === 'week' ? "MMMM yyyy" : "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <button 
              onClick={() => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))} 
              className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-aura-charcoal/5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-aura-charcoal/40" />
            <select 
              className="bg-white border border-aura-charcoal/10 rounded-full pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 ring-aura-gold/20"
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
            >
              <option value="all">Todas as Profissionais</option>
              {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="aura-button aura-button-primary flex items-center gap-2 shadow-lg shadow-aura-charcoal/10"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[500px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-aura-gold" />
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'week' ? "grid-cols-7" : "grid-cols-1 max-w-3xl mx-auto"
        )}>
          {weekDays.map((day, i) => (
            <div key={i} className="space-y-4">
              <div className={cn(
                "text-center p-4 rounded-2xl border transition-all",
                isSameDay(day, new Date()) ? "bg-aura-charcoal text-white border-aura-charcoal shadow-md scale-105" : "bg-white/50 border-aura-charcoal/5"
              )}>
                <p className={cn("text-[10px] uppercase tracking-widest", isSameDay(day, new Date()) ? "text-aura-gold" : "text-aura-charcoal/40")}>
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p className="text-xl font-serif mt-1">{format(day, "d")}</p>
              </div>

              <div className="space-y-3 min-h-[500px]">
                {appointments
                  .filter(a => isSameDay(new Date(a.start_time), day))
                  .filter(a => selectedProf === 'all' || a.professional_id === selectedProf)
                  .map((appt) => (
                    <motion.div 
                      layout 
                      key={appt.id} 
                      className={cn(
                        "glass-card p-4 border-l-4 transition-all group relative",
                        getStatusStyles(appt.status)
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-aura-charcoal/40 flex items-center gap-1">
                          {getStatusIcon(appt.status)}
                          {format(new Date(appt.start_time), "HH:mm")}
                        </span>
                        {appt.price > 0 && <span className="text-[10px] font-bold text-aura-sage">R$ {appt.price}</span>}
                      </div>
                      
                      <p className="font-serif text-sm mb-1 truncate leading-tight">{appt.customer_name}</p>
                      <p className="text-[10px] text-aura-charcoal/40 uppercase tracking-wider truncate mb-3">
                        {appt.service_name || (appt.is_blocked ? 'INDISPONÍVEL' : 'Serviço')}
                      </p>

                      {!appt.is_blocked && (
                        <div className="flex items-center gap-2 pt-2 border-t border-aura-charcoal/5">
                          <select 
                            value={appt.status} 
                            onChange={(e) => handleStatusUpdate(appt, e.target.value as AppointmentStatus)}
                            className="bg-transparent border-none text-[9px] font-bold uppercase tracking-[0.15em] outline-none cursor-pointer hover:text-aura-gold transition-colors w-full"
                          >
                            <option value="scheduled">Agendado</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      )}
                    </motion.div>
                  ))}
                {appointments.filter(a => isSameDay(new Date(a.start_time), day)).length === 0 && (
                  <div className="h-20 border-2 border-dashed border-aura-charcoal/5 rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-aura-charcoal/20">Vazio</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Agendamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-aura-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-8 max-w-md w-full space-y-8 bg-white"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif italic">Novo Agendamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-aura-charcoal/40 hover:text-aura-charcoal">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-6">
                <div className="flex gap-2 p-1 bg-aura-soft-gray rounded-full">
                  <button 
                    type="button" 
                    onClick={() => setNewAppt({...newAppt, is_blocked: false})}
                    className={cn("flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", !newAppt.is_blocked ? "bg-white text-aura-charcoal shadow-sm" : "text-aura-charcoal/40")}
                  >
                    Cliente
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewAppt({...newAppt, is_blocked: true})}
                    className={cn("flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", newAppt.is_blocked ? "bg-aura-charcoal text-white shadow-sm" : "text-aura-charcoal/40")}
                  >
                    Bloqueio
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                      {newAppt.is_blocked ? 'Motivo do Bloqueio' : 'Nome do Cliente'}
                    </label>
                    <input 
                      required 
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm" 
                      value={newAppt.customer_name} 
                      onChange={e => setNewAppt({...newAppt, customer_name: e.target.value})} 
                    />
                  </div>

                  {!newAppt.is_blocked && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Serviço</label>
                      <input 
                        required 
                        placeholder="Ex: Corte de Cabelo"
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm" 
                        value={newAppt.service_name} 
                        onChange={e => setNewAppt({...newAppt, service_name: e.target.value})} 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Profissional</label>
                      <select 
                        required 
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm" 
                        value={newAppt.professional_id} 
                        onChange={e => setNewAppt({...newAppt, professional_id: e.target.value})}
                      >
                        <option value="">Selecionar...</option>
                        {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Preço (R$)</label>
                      <input 
                        type="number" 
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm" 
                        value={newAppt.price} 
                        onChange={e => setNewAppt({...newAppt, price: Number(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Data e Horário</label>
                    <input 
                      type="datetime-local" 
                      required 
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm" 
                      value={newAppt.start_time} 
                      onChange={e => setNewAppt({...newAppt, start_time: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="aura-button aura-button-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="aura-button aura-button-primary flex-1"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}