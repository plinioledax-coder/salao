import React, { useState, useEffect, useMemo } from "react";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../services/api/finance";
import { Transaction, TransactionType } from "../types";
import { cn } from "../utils/cn";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Download,
  DollarSign,
  TrendingUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_STATE: Omit<Transaction, "id" | "created_at" | "appointment_id"> =
  {
    description: "",
    amount: 0,
    type: "income",
    category: "Serviços",
    date: new Date().toISOString(),
  };

export function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState(INITIAL_STATE);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      alert("Erro ao carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcula o resumo financeiro automaticamente
  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === "income") acc.income += Number(curr.amount);
        else acc.expense += Number(curr.amount);
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createTransaction({
        ...newTx,
        // Garantir que a data esteja no formato correto pro Postgres
        date: new Date(newTx.date).toISOString(),
      });
      await fetchData();
      setIsModalOpen(false);
      setNewTx(INITIAL_STATE);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao registrar a transação.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir este registro financeiro?")) {
      try {
        await deleteTransaction(id);
        await fetchData();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao remover a transação.");
      }
    }
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
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 bg-aura-charcoal text-white">
          <p className="text-[10px] uppercase tracking-widest opacity-50">
            Saldo Total
          </p>
          <p className="text-4xl font-serif mt-2">
            R${" "}
            {(summary.income - summary.expense).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-aura-gold">
            <TrendingUp className="w-4 h-4" />
            <span>Resumo atualizado</span>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-green-50 text-green-600">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
              Entradas
            </p>
          </div>
          <p className="text-3xl font-serif text-green-600">
            R${" "}
            {summary.income.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
              Saídas
            </p>
          </div>
          <p className="text-3xl font-serif text-red-600">
            R${" "}
            {summary.expense.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Header da Lista */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif italic">Transações Recentes</h3>
        <div className="flex gap-3">
          <button className="aura-button aura-button-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="aura-button aura-button-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-aura-charcoal/5">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-6 flex items-center justify-between hover:bg-aura-soft-gray/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "p-3 rounded-2xl",
                    tx.type === "income"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600",
                  )}
                >
                  {tx.type === "income" ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-aura-charcoal/40">
                    {tx.category} •{" "}
                    {format(new Date(tx.date), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p
                  className={cn(
                    "text-lg font-serif",
                    tx.type === "income" ? "text-green-600" : "text-red-600",
                  )}
                >
                  {tx.type === "income" ? "+" : "-"} R${" "}
                  {Number(tx.amount).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="p-2 text-aura-charcoal/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-20 text-center text-aura-charcoal/30">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhuma transação registrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Transação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-aura-charcoal/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 max-w-md w-full space-y-6 bg-white"
            >
              <h3 className="text-2xl font-serif italic">
                Novo Registro Financeiro
              </h3>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex gap-2 p-1 bg-aura-soft-gray rounded-full mb-6">
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: "income" })}
                    className={cn(
                      "flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                      newTx.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "text-aura-charcoal/40 hover:text-aura-charcoal",
                    )}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: "expense" })}
                    className={cn(
                      "flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                      newTx.type === "expense"
                        ? "bg-red-100 text-red-700"
                        : "text-aura-charcoal/40 hover:text-aura-charcoal",
                    )}
                  >
                    Saída
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                    Descrição
                  </label>
                  <input
                    required
                    placeholder={
                      newTx.type === "income"
                        ? "Ex: Pagamento Cliente X"
                        : "Ex: Conta de Luz"
                    }
                    className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                    value={newTx.description}
                    onChange={(e) =>
                      setNewTx({ ...newTx, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                      value={newTx.amount}
                      onChange={(e) =>
                        setNewTx({ ...newTx, amount: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                      Categoria
                    </label>
                    <input
                      required
                      placeholder="Ex: Serviços, Contas..."
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                      value={newTx.category}
                      onChange={(e) =>
                        setNewTx({ ...newTx, category: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                    value={newTx.date.split("T")[0]}
                    onChange={(e) =>
                      setNewTx({
                        ...newTx,
                        date: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
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
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirmar"
                    )}
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
