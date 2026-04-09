import React, { useState, useEffect } from 'react';
import { getCustomers, getCustomerCRMData, updateCustomer, CustomerCRMData } from '../services/api/customers';
import { Customer } from '../types';
import { cn } from '../utils/cn';
import {
  Users, Search, Plus, Loader2, X, MessageCircle, Mail,
  Calendar as CalendarIcon, Clock, Star, TrendingUp, Gift, Heart, Edit3, Save, CheckCircle2, User, Phone, Cake
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

// --- HELPER DE ANIVERSÁRIO ---
function formatBirthday(dateStr?: string) {
  if (!dateStr) return 'Não informado';
  try {
    let day, month;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      day = parts[2]; month = parts[1];
    } else {
      const parts = dateStr.split('/');
      day = parts[0]; month = parts[1];
    }
    const date = new Date(2024, Number(month) - 1, Number(day));
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Drawer & CRM States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [crmData, setCrmData] = useState<CustomerCRMData | null>(null);
  const [loadingCrm, setLoadingCrm] = useState(false);

  // Edit Mode States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    setFiltered(
      customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
      )
    );
  }, [search, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleOpenProfile = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm(customer); // Inicializa o form com os dados atuais
    setNotes(customer.notes || '');
    setIsEditingProfile(false);
    setCrmData(null);
    setLoadingCrm(true);

    try {
      const data = await getCustomerCRMData(customer.id, customer.name);
      setCrmData(data);
    } catch (error) { console.error(error); } finally { setLoadingCrm(false); }
  };

  const handleUpdateProfile = async () => {
    if (!selectedCustomer) return;
    setIsSaving(true);
    try {
      const updates = { ...editForm, notes };
      await updateCustomer(selectedCustomer.id, updates);

      // Atualiza a lista local
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...updates } : c));
      setSelectedCustomer({ ...selectedCustomer, ...updates } as Customer);
      setIsEditingProfile(false);
    } catch (error) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const whatsappLink = (phone?: string) => {
    const num = phone ? phone.replace(/\D/g, "") : "00000000000";
    return `https://wa.me/55${num}`;
  };

  if (loading) return <div className="flex-1 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-aura-gold" /></div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 p-6 rounded-3xl border border-aura-charcoal/5 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif italic text-aura-charcoal">Base de Clientes</h3>
          <p className="text-sm text-aura-charcoal/40">{customers.length} clientes registados</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-charcoal/40" />
            <input
              placeholder="Buscar por nome ou telemóvel..."
              className="w-full bg-white border border-aura-charcoal/10 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-aura-gold/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="aura-button aura-button-primary flex items-center gap-2 shadow-lg shadow-aura-charcoal/10">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((customer, i) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => handleOpenProfile(customer)}
            className="glass-card p-6 cursor-pointer hover:ring-2 hover:ring-aura-gold/30 transition-all group flex items-start gap-4 border border-aura-charcoal/5"
          >
            <div className="w-12 h-12 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20 group-hover:text-aura-gold group-hover:bg-aura-gold/10 transition-all shrink-0">
              {customer.is_vip ? <Star className="w-5 h-5 fill-aura-gold text-aura-gold" /> : <Users className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-lg text-aura-charcoal truncate">{customer.name}</h4>
              <p className="text-xs text-aura-charcoal/50 mt-0.5">{customer.phone || 'Sem contacto'}</p>
              <div className="flex gap-2 mt-3">
                {customer.loyalty_points > 0 && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-aura-gold/10 text-aura-gold border border-aura-gold/20 flex items-center gap-1"><Gift className="w-3 h-3" /> {customer.loyalty_points} pts</span>}
                {customer.birthday && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-aura-clay/10 text-aura-clay border border-aura-clay/20">🎂 {formatBirthday(customer.birthday)}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CRM DRAWER */}
      <Drawer open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={isEditingProfile ? "Editar Dados do Cliente" : "Perfil do Cliente"}>
        {selectedCustomer && (
          <div className="space-y-8 pb-10">

            {/* MODO EDIÇÃO VS VISUALIZAÇÃO */}
            {!isEditingProfile ? (
              <>
                <div className="text-center space-y-2 relative group">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="absolute top-0 right-0 p-2 bg-white rounded-xl shadow-sm border border-aura-charcoal/5 text-aura-gold hover:bg-aura-gold hover:text-white transition-all"
                    title="Editar Perfil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <div className="w-20 h-20 mx-auto rounded-full bg-white border border-aura-charcoal/10 shadow-sm flex items-center justify-center text-aura-gold">
                    {selectedCustomer.is_vip ? <Star className="w-10 h-10 fill-aura-gold" /> : <Heart className="w-10 h-10" />}
                  </div>
                  <h3 className="text-2xl font-serif text-aura-charcoal">{selectedCustomer.name}</h3>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-aura-charcoal/60 flex items-center gap-2"><Phone className="w-3 h-3" /> {selectedCustomer.phone || 'Nenhum telemóvel'}</p>
                    <p className="text-xs text-aura-charcoal/60 flex items-center gap-2"><Mail className="w-3 h-3" /> {selectedCustomer.email || 'Nenhum e-mail'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href={whatsappLink(selectedCustomer.phone)} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-[#25D366]/10 text-[#20b857] rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest border border-[#25D366]/20">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>

                {loadingCrm ? (
                  <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-aura-gold mx-auto" /></div>
                ) : crmData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-aura-charcoal/5 shadow-sm text-center">
                        <TrendingUp className="w-4 h-4 mx-auto text-aura-sage mb-2" />
                        <p className="text-lg font-serif text-aura-charcoal">R$ {crmData.ltv.toFixed(2)}</p>
                        <p className="text-[9px] text-aura-charcoal/40 uppercase tracking-widest">Total Gasto (LTV)</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-aura-charcoal/5 shadow-sm text-center">
                        <Star className="w-4 h-4 mx-auto text-aura-gold mb-2" />
                        <p className="text-sm font-bold text-aura-charcoal truncate">{crmData.favoriteProfessional}</p>
                        <p className="text-[9px] text-aura-charcoal/40 uppercase tracking-widest mt-1">Prof. Favorito</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-aura-gold/5 border border-aura-gold/20">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-xs font-bold text-aura-charcoal uppercase tracking-widest flex items-center gap-2"><Gift className="w-4 h-4 text-aura-gold" /> Fidelidade</p>
                        <span className="text-lg font-serif text-aura-gold">{selectedCustomer.loyalty_points || 0}</span>
                      </div>
                      <div className="h-2 bg-aura-gold/20 rounded-full overflow-hidden">
                        <div className="h-full bg-aura-gold rounded-full" style={{ width: `${Math.min(((selectedCustomer.loyalty_points || 0) % 100), 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-aura-charcoal/60 uppercase tracking-widest font-bold flex items-center gap-2"><Edit3 className="w-3 h-3" /> Notas Privadas</p>
                      <textarea
                        className="w-full h-24 bg-white border border-aura-charcoal/10 rounded-2xl p-4 text-sm outline-none resize-none"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        onBlur={handleUpdateProfile} // Salva ao sair do campo
                        placeholder="Clique para adicionar notas..."
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-aura-charcoal/10">
                      <p className="text-lg font-serif italic text-aura-charcoal">Histórico</p>
                      {crmData.completedHistory.map((appt) => (
                        <div key={appt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-aura-charcoal/5">
                          <CheckCircle2 className="w-5 h-5 text-aura-sage" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{appt.service_name}</p>
                            <p className="text-[10px] text-aura-charcoal/40 uppercase">{format(new Date(appt.start_time), "dd/MM/yyyy")}</p>
                          </div>
                          <span className="text-sm font-bold text-aura-charcoal">R$ {appt.price}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* FORMULÁRIO DE EDIÇÃO */
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">Nome do Cliente</label>
                    <input className="w-full bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-aura-gold/20" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">WhatsApp / Telemóvel</label>
                    <input className="w-full bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">E-mail</label>
                    <input className="w-full bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">Aniversário (DD/MM)</label>
                      <input className="w-full bg-white border border-aura-charcoal/10 rounded-xl px-4 py-3 text-sm outline-none" value={editForm.birthday} onChange={e => setEditForm({ ...editForm, birthday: e.target.value })} placeholder="Ex: 15/04" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">Status VIP</label>
                      <button
                        onClick={() => setEditForm({ ...editForm, is_vip: !editForm.is_vip })}
                        className={cn("w-full py-3 rounded-xl text-xs font-bold transition-all border", editForm.is_vip ? "bg-aura-gold text-white border-aura-gold" : "bg-white text-aura-charcoal/40 border-aura-charcoal/10")}
                      >
                        {editForm.is_vip ? "CLIENTE VIP" : "CLIENTE PADRÃO"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 rounded-2xl bg-aura-soft-gray text-aura-charcoal font-bold text-xs uppercase tracking-widest">Cancelar</button>
                  <button onClick={handleUpdateProfile} disabled={isSaving} className="flex-1 py-4 rounded-2xl bg-aura-charcoal text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Alterações
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