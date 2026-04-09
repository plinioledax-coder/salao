import React, { useState, useEffect } from 'react';
import { getProfessionals, updateProfessional, createProfessional, getProfessionalDashboard, ProfessionalData, ProfDashboardStats } from '../services/api/professionals';
import { cn } from '../utils/cn';
import { 
  Users, Search, Plus, Loader2, X, Scissors, Edit3, Save, 
  TrendingUp, DollarSign, Calendar as CalendarIcon, Clock, Power, PowerOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- DRAWER COMPONENT ---
function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-aura-cream shadow-2xl z-50 flex flex-col border-l border-aura-charcoal/5">
            <div className="flex items-center justify-between px-6 py-5 border-b border-aura-charcoal/5 bg-white/50 backdrop-blur-md">
              <h2 className="font-serif text-xl italic">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-aura-soft-gray transition-colors text-aura-charcoal/40 hover:text-aura-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Professionals() {
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Drawer & Dashboard States
  const [selectedProf, setSelectedProf] = useState<ProfessionalData | null>(null);
  const [dashboardData, setDashboardData] = useState<ProfDashboardStats | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfessionalData>>({});
  const [specialtiesInput, setSpecialtiesInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await getProfessionals(true); // Puxa todos, ativos e inativos
      setProfessionals(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const filtered = professionals.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenProfile = async (prof: ProfessionalData) => {
    setSelectedProf(prof);
    setIsEditing(false);
    setIsCreating(false);
    setEditForm(prof);
    setSpecialtiesInput(prof.specialties?.join(', ') || '');
    setDashboardData(null);
    setLoadingDash(true);
    
    try {
      const data = await getProfessionalDashboard(prof.id);
      setDashboardData(data);
    } catch (error) { console.error(error); } finally { setLoadingDash(false); }
  };

  const handleOpenCreate = () => {
    setSelectedProf(null);
    setIsCreating(true);
    setIsEditing(true);
    setEditForm({ name: '', role: '', commission_rate: 0, active: true, specialties: [] });
    setSpecialtiesInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const specsArray = specialtiesInput.split(',').map(s => s.trim()).filter(Boolean);
      const payload = { ...editForm, specialties: specsArray };

      if (isCreating) {
        await createProfessional(payload);
      } else if (selectedProf) {
        await updateProfessional(selectedProf.id, payload);
      }
      
      await fetchTeam();
      setIsEditing(false);
      setIsCreating(false);
      if (selectedProf) handleOpenProfile({ ...selectedProf, ...payload } as ProfessionalData);
    } catch (error) {
      alert("Erro ao salvar profissional.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-aura-gold" /></div>;

  return (
    <div className="space-y-6">
      {/* HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 p-6 rounded-3xl border border-aura-charcoal/5 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif italic text-aura-charcoal">A Nossa Equipa</h3>
          <p className="text-sm text-aura-charcoal/40">{professionals.filter(p => p.active).length} profissionais ativos</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-charcoal/40" />
            <input 
              placeholder="Procurar membro..." 
              className="w-full bg-white border border-aura-charcoal/10 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-aura-gold/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={handleOpenCreate} className="aura-button aura-button-primary flex items-center gap-2 shadow-lg shadow-aura-charcoal/10 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Novo Membro
          </button>
        </div>
      </div>

      {/* GRID DE EQUIPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prof, i) => (
          <motion.div 
            key={prof.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => handleOpenProfile(prof)}
            className={cn(
              "glass-card p-6 cursor-pointer transition-all group flex flex-col border border-aura-charcoal/5",
              !prof.active ? "opacity-60 grayscale hover:grayscale-0" : "hover:ring-2 hover:ring-aura-gold/30"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20 group-hover:text-aura-gold transition-colors shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-lg text-aura-charcoal truncate">{prof.name}</h4>
                <p className="text-xs text-aura-charcoal/50 mt-0.5 uppercase tracking-widest font-bold">{prof.role}</p>
              </div>
              {!prof.active && (
                <span className="text-[9px] px-2 py-1 rounded bg-red-100 text-red-600 font-bold uppercase tracking-widest">Inativo</span>
              )}
            </div>

            {/* Tags de Especialidades */}
            {prof.specialties && prof.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-aura-charcoal/5">
                {prof.specialties.slice(0, 3).map((spec, idx) => (
                  <span key={idx} className="text-[9px] px-2 py-1 rounded-md bg-white border border-aura-charcoal/10 text-aura-charcoal/60 font-medium">
                    {spec}
                  </span>
                ))}
                {prof.specialties.length > 3 && <span className="text-[9px] px-2 py-1 text-aura-charcoal/40">+{prof.specialties.length - 3}</span>}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* DRAWER RH & DASHBOARD */}
      <Drawer open={!!selectedProf || isCreating} onClose={() => { setSelectedProf(null); setIsCreating(false); }} title={isEditing ? (isCreating ? "Novo Membro" : "Editar Perfil") : "Painel do Profissional"}>
        {(selectedProf || isCreating) && (
          <div className="space-y-8 pb-10">
            
            {!isEditing && selectedProf ? (
              <>
                <div className="text-center space-y-2 relative group">
                  <button onClick={() => setIsEditing(true)} className="absolute top-0 right-0 p-2 bg-white rounded-xl shadow-sm border border-aura-charcoal/5 text-aura-gold hover:bg-aura-gold hover:text-white transition-all" title="Editar Profissional">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <div className="w-20 h-20 mx-auto rounded-full bg-aura-charcoal shadow-md flex items-center justify-center text-aura-gold">
                    <Scissors className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif text-aura-charcoal">{selectedProf.name}</h3>
                  <p className="text-xs text-aura-charcoal/60 uppercase tracking-widest font-bold">{selectedProf.role}</p>
                  
                  {!selectedProf.active && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2 inline-flex items-center gap-1"><PowerOff className="w-3 h-3"/> Conta Inativada</p>}
                </div>

                {loadingDash ? (
                  <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-aura-gold mx-auto" /></div>
                ) : dashboardData && (
                  <>
                    {/* ESTATÍSTICAS E COMISSÃO */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-aura-charcoal/5 shadow-sm">
                        <p className="text-[9px] text-aura-charcoal/40 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Faturado (Mês)</p>
                        <p className="text-lg font-serif text-aura-charcoal">R$ {dashboardData.totalRevenue.toFixed(2)}</p>
                        <p className="text-[10px] text-aura-charcoal/40 mt-1">{dashboardData.totalAttendances} atendimentos</p>
                      </div>
                      
                      {/* CÁLCULO MÁGICO DE COMISSÃO */}
                      <div className="p-4 rounded-2xl bg-aura-gold/5 border border-aura-gold/20 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-12 h-12 bg-aura-gold/10 rounded-full blur-xl"></div>
                        <p className="text-[9px] text-aura-gold uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> A Receber</p>
                        <p className="text-lg font-serif text-aura-gold font-bold">
                          R$ {((dashboardData.totalRevenue * (selectedProf.commission_rate || 0)) / 100).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-aura-gold/60 mt-1">Taxa de {selectedProf.commission_rate || 0}%</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-aura-charcoal/5 shadow-sm text-center flex items-center justify-between">
                      <p className="text-[10px] text-aura-charcoal/40 uppercase tracking-widest font-bold">Ticket Médio</p>
                      <p className="font-serif text-aura-charcoal">R$ {dashboardData.averageTicket.toFixed(2)} / cliente</p>
                    </div>

                    {/* AGENDA FUTURA (Próximos 5) */}
                    <div className="space-y-4 pt-4 border-t border-aura-charcoal/10">
                      <p className="text-lg font-serif italic text-aura-charcoal flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-aura-gold" /> Próximos Atendimentos
                      </p>
                      
                      {dashboardData.upcoming.length === 0 ? (
                        <p className="text-sm text-aura-charcoal/40 text-center py-6 bg-white rounded-2xl border border-dashed border-aura-charcoal/10">Agenda livre nos próximos dias.</p>
                      ) : (
                        <div className="space-y-3">
                          {dashboardData.upcoming.map((appt) => (
                            <div key={appt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-aura-charcoal/5 shadow-sm">
                              <div className="w-10 h-10 rounded-xl bg-aura-soft-gray flex flex-col items-center justify-center shrink-0">
                                <span className="text-[9px] uppercase tracking-widest text-aura-charcoal/40 font-bold leading-none">{format(new Date(appt.start_time), "MMM", { locale: ptBR })}</span>
                                <span className="text-sm font-serif leading-none mt-1">{format(new Date(appt.start_time), "dd")}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-aura-charcoal truncate">{appt.customer_name}</p>
                                <p className="text-[10px] text-aura-charcoal/50 truncate">{appt.service_name}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-aura-gold flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(appt.start_time), "HH:mm")}</span>
                                <span className={cn("text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded mt-1 inline-block", appt.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                                  {appt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* MODO DE EDIÇÃO / CRIAÇÃO */
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">Nome do Profissional</label>
                    <input className="w-full bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-aura-gold/20" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Ex: Ana Silva" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">Cargo</label>
                      <input className="w-full bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Ex: Cabelereira" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold text-aura-gold">Comissão (%)</label>
                      <input type="number" className="w-full bg-white border border-aura-gold/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-aura-gold/50" value={editForm.commission_rate} onChange={e => setEditForm({...editForm, commission_rate: Number(e.target.value)})} placeholder="Ex: 50" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">Especialidades (separadas por vírgula)</label>
                    <textarea 
                      className="w-full h-20 bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none resize-none" 
                      value={specialtiesInput} 
                      onChange={e => setSpecialtiesInput(e.target.value)} 
                      placeholder="Ex: Corte Feminino, Coloração, Escova..." 
                    />
                  </div>

                  <div className="pt-2 border-t border-aura-charcoal/10">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold mb-2 block">Acesso ao Sistema</label>
                    <button 
                      onClick={() => setEditForm({...editForm, active: !editForm.active})}
                      className={cn("w-full py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2", editForm.active ? "bg-white border-aura-charcoal/10 text-aura-charcoal" : "bg-red-50 border-red-200 text-red-500")}
                    >
                      <Power className="w-4 h-4" />
                      {editForm.active ? "CONTA ATIVA" : "CONTA INATIVA (BLOQUEADA)"}
                    </button>
                    <p className="text-[9px] text-aura-charcoal/40 mt-2 text-center">Inativar oculta o profissional da agenda, mas preserva o histórico financeiro.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => { setIsEditing(false); setIsCreating(false); }} className="flex-1 py-4 rounded-2xl bg-aura-soft-gray text-aura-charcoal font-bold text-xs uppercase tracking-widest">Cancelar</button>
                  <button onClick={handleSave} disabled={isSaving || !editForm.name} className="flex-1 py-4 rounded-2xl bg-aura-charcoal text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Dados
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}