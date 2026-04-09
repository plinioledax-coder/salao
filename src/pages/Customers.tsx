import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api/customers';
import { Customer } from '../types';
import { cn } from '../utils/cn'; // Ajuste o caminho do seu utilitário
import { 
  Plus, Search, User, Phone, Mail, Trash2, Edit2, 
  Star, FileText, Cake, History, AlertTriangle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_CUSTOMER_STATE: Omit<Customer, 'id' | 'created_at'> = {
  name: '',
  phone: '',
  email: '',
  birthday: '',
  notes: '',
  loyalty_points: 0,
  is_vip: false,
  total_spent: 0,
  technical_file_allergies: '',
  technical_file_formulas: ''
};

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  const [newCustomer, setNewCustomer] = useState(INITIAL_CUSTOMER_STATE);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      alert("Erro ao carregar clientes. Tente novamente.");
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
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, newCustomer);
      } else {
        await createCustomer(newCustomer);
      }
      await fetchData(); // Recarrega a lista após salvar
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este cliente permanentemente?')) {
      try {
        await deleteCustomer(id);
        setSelectedCustomer(null);
        await fetchData();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar cliente.");
      }
    }
  };

  const resetForm = () => {
    setNewCustomer(INITIAL_CUSTOMER_STATE);
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-aura-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Barra de Busca e Botão Novo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-charcoal/30" />
          <input 
            placeholder="Buscar por nome ou telefone..."
            className="w-full bg-white border border-aura-charcoal/5 rounded-full pl-12 pr-4 py-3 text-sm outline-none focus:border-aura-gold/30 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="aura-button aura-button-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, i) => (
          <motion.div 
            key={customer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 group hover:border-aura-gold/30 transition-all cursor-pointer"
            onClick={() => { 
              setSelectedCustomer(customer); 
              setNewCustomer(customer); // Prepara os dados caso ele clique em editar depois
              setViewMode('details'); 
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg group-hover:text-aura-gold transition-colors flex items-center gap-2">
                    {customer.name}
                    {customer.is_vip && (
                      <span className="text-[8px] bg-aura-gold text-white px-1.5 py-0.5 rounded-full font-bold tracking-widest">VIP</span>
                    )}
                  </h4>
                  <p className="text-xs text-aura-charcoal/40">{customer.phone}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-aura-gold">
                  <Star className="w-3 h-3 fill-aura-gold" />
                  <span className="text-xs font-bold">{customer.loyalty_points || 0} pts</span>
                </div>
                {customer.birthday && (
                  <div className="flex items-center gap-1 text-aura-clay mt-1">
                    <Cake className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{customer.birthday}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-aura-charcoal/40">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* Modal de Detalhes (Sidebar Direita) */}
      <AnimatePresence>
        {selectedCustomer && viewMode === 'details' && (
          <div className="fixed inset-0 bg-aura-charcoal/20 backdrop-blur-sm flex items-center justify-end z-50">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-2xl h-full bg-aura-cream shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs uppercase tracking-widest text-aura-charcoal/40 hover:text-aura-charcoal transition-colors"
                >
                  ← Voltar
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsModalOpen(true); }}
                    className="p-2 rounded-full hover:bg-aura-soft-gray text-aura-charcoal/60 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedCustomer.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-12">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[32px] bg-aura-soft-gray flex items-center justify-center text-aura-charcoal/20">
                    <User className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-serif italic flex items-center gap-4">
                      {selectedCustomer.name}
                      {selectedCustomer.is_vip && (
                        <span className="text-xs bg-aura-gold text-white px-3 py-1 rounded-full font-bold tracking-widest not-italic">VIP</span>
                      )}
                    </h2>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-xs text-aura-charcoal/60"><Phone className="w-3 h-3" /> {selectedCustomer.phone}</span>
                      <span className="flex items-center gap-1 text-xs text-aura-charcoal/60"><Mail className="w-3 h-3" /> {selectedCustomer.email || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="glass-card p-6 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 mb-2">Pontos Fidelidade</p>
                    <p className="text-2xl font-serif text-aura-gold">{selectedCustomer.loyalty_points || 0}</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 mb-2">Total Gasto</p>
                    <p className="text-2xl font-serif text-aura-sage">R$ {Number(selectedCustomer.total_spent)?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 mb-2">Aniversário</p>
                    <p className="text-2xl font-serif text-aura-clay">{selectedCustomer.birthday || '—'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-serif italic flex items-center gap-2">
                    <FileText className="w-5 h-5 text-aura-gold" /> Ficha Técnica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Alergias / Restrições</p>
                      <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <p>{selectedCustomer.technical_file_allergies || 'Nenhuma restrição registrada.'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Fórmulas e Preferências</p>
                      <div className="p-4 rounded-2xl bg-white border border-aura-charcoal/5 text-sm italic text-aura-charcoal/80">
                        {selectedCustomer.technical_file_formulas || 'Sem fórmulas registradas.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-aura-charcoal/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-8 bg-white"
            >
              <h3 className="text-2xl font-serif italic">{selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              
              <form onSubmit={handleAdd} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-aura-gold font-bold">Dados Pessoais</h4>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Nome Completo</label>
                      <input 
                        required
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                        value={newCustomer.name}
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Telefone</label>
                      <input 
                        required
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">E-mail</label>
                      <input 
                        type="email"
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Aniversário (DD/MM)</label>
                      <input 
                        placeholder="Ex: 15/03"
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none"
                        value={newCustomer.birthday}
                        onChange={e => setNewCustomer({...newCustomer, birthday: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setNewCustomer({...newCustomer, is_vip: !newCustomer.is_vip})}
                        className={cn(
                          "w-10 h-6 rounded-full transition-all relative",
                          newCustomer.is_vip ? "bg-aura-gold" : "bg-aura-charcoal/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          newCustomer.is_vip ? "left-5" : "left-1"
                        )} />
                      </button>
                      <span className="text-xs font-medium text-aura-charcoal/60">Cliente VIP</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-aura-gold font-bold">Ficha Técnica</h4>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Alergias</label>
                      <textarea 
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none h-20 resize-none"
                        value={newCustomer.technical_file_allergies}
                        onChange={e => setNewCustomer({...newCustomer, technical_file_allergies: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">Fórmulas / Preferências</label>
                      <textarea 
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none h-32 resize-none"
                        value={newCustomer.technical_file_formulas}
                        onChange={e => setNewCustomer({...newCustomer, technical_file_formulas: e.target.value})}
                      />
                    </div>
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
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Cliente'}
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