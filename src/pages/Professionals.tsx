import React, { useState, useEffect } from 'react';
import { getProfessionals, createProfessional, updateProfessional, deleteProfessional } from '../services/api/professionals';
import { Professional } from '../types';
import { cn } from '../utils/cn';
import { 
  Plus, User, Trash2, Edit2, Target, DollarSign, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_STATE: Omit<Professional, 'id' | 'created_at'> = {
  name: '',
  role: '',
  active: true,
  commission_rate: 30,
  goals_monthly_revenue: 5000,
  goals_appointments: 100
};

export function Professionals() {
  const [profs, setProfs] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [newProf, setNewProf] = useState(INITIAL_STATE);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getProfessionals();
      setProfs(data);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      alert("Erro ao carregar a equipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (selectedProf) {
        await updateProfessional(selectedProf.id, newProf);
      } else {
        await createProfessional(newProf);
      }
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
      alert("Erro ao salvar. Verifique se preencheu tudo corretamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este profissional? Isso pode afetar o histórico de agendamentos.')) {
      try {
        await deleteProfessional(id);
        await fetchData();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar profissional.");
      }
    }
  };

  const resetForm = () => {
    setNewProf(INITIAL_STATE);
    setSelectedProf(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-aura-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif italic">Nossa Equipe</h3>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="aura-button aura-button-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Profissional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {profs.map((prof, i) => (
          <motion.div 
            key={prof.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => { setSelectedProf(prof); setNewProf(prof); setIsModalOpen(true); }}
                className="p-2 rounded-full bg-white shadow-sm text-aura-charcoal/40 hover:text-aura-gold transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(prof.id)}
                className="p-2 rounded-full bg-white shadow-sm text-red-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-[28px] bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20 relative">
                <User className="w-10 h-10" />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                  prof.active ? "bg-aura-sage" : "bg-red-400"
                )}></div>
              </div>
              <div>
                <h4 className="text-xl font-serif italic">{prof.name}</h4>
                <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">{prof.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-aura-charcoal/5">
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-aura-charcoal/40 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Comissão
                </p>
                <p className="text-sm font-medium">{prof.commission_rate}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-aura-charcoal/40 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Meta Mensal
                </p>
                <p className="text-sm font-medium">R$ {Number(prof.goals_monthly_revenue).toLocaleString()}</p>
              </div>
            </div>

            {/* Simulação de Progresso da Meta (Pode ser integrado com financeiro depois) */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                <span className="text-aura-charcoal/40">Progresso da Meta</span>
                <span className="text-aura-sage">0%</span>
              </div>
              <div className="h-1.5 w-full bg-aura-soft-gray rounded-full overflow-hidden">
                <div className="h-full bg-aura-sage w-0"></div>
              </div>
            </div>
          </motion.div>
        ))}
        {profs.length === 0 && (
          <div className="col-span-full py-12 text-center text-aura-charcoal/40">
            Nenhum profissional cadastrado.
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-aura-charcoal/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 max-w-md w-full space-y-8 bg-white"
            >
              <h3 className="text-2xl font-serif italic">{selectedProf ? 'Editar Profissional' : 'Novo Profissional'}</h3>
              
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Nome</label>
                    <input 
                      required
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                      value={newProf.name}
                      onChange={e => setNewProf({...newProf, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Especialidade</label>
                    <select 
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                      value={newProf.role}
                      onChange={e => setNewProf({...newProf, role: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="Cabelereira">Cabelereira</option>
                      <option value="Manicure">Manicure</option>
                      <option value="Pedicure">Pedicure</option>
                      <option value="Esteticista">Esteticista</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Comissão (%)</label>
                      <input 
                        type="number"
                        required
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                        value={newProf.commission_rate}
                        onChange={e => setNewProf({...newProf, commission_rate: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Meta (R$)</label>
                      <input 
                        type="number"
                        required
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                        value={newProf.goals_monthly_revenue}
                        onChange={e => setNewProf({...newProf, goals_monthly_revenue: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="active"
                      checked={newProf.active}
                      onChange={e => setNewProf({...newProf, active: e.target.checked})}
                      className="w-4 h-4 rounded border-aura-charcoal/10 text-aura-gold focus:ring-aura-gold"
                    />
                    <label htmlFor="active" className="text-sm text-aura-charcoal/60">Ativo na equipe</label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="aura-button aura-button-secondary flex-1"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="aura-button aura-button-primary flex-1 flex items-center justify-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
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