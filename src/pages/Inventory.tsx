import React, { useState, useEffect } from "react";
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../services/api/inventory";
import { InventoryItem } from "../types";
import {
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_STATE: Omit<InventoryItem, "id" | "created_at"> = {
  name: "",
  category: "",
  quantity: 0,
  min_quantity: 5,
  unit_price: 0,
};

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState(INITIAL_STATE);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setItems(data);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      alert("Erro ao carregar o estoque.");
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
      if (selectedItem) {
        await updateInventoryItem(selectedItem.id, newItem);
      } else {
        await createInventoryItem(newItem);
      }
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      alert("Erro ao salvar produto no estoque.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item do estoque?")) {
      try {
        await deleteInventoryItem(id);
        await fetchData();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao excluir item.");
      }
    }
  };

  const resetForm = () => {
    setNewItem(INITIAL_STATE);
    setSelectedItem(null);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
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
      {/* Header e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-charcoal/30" />
          <input
            placeholder="Buscar no estoque..."
            className="w-full bg-white border border-aura-charcoal/5 rounded-full pl-12 pr-6 py-3 text-sm outline-none focus:ring-2 ring-aura-gold/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="aura-button aura-button-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Adicionar Item
        </button>
      </div>

      {/* Tabela */}
      <div className="glass-card overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-aura-soft-gray/50 border-b border-aura-charcoal/5">
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                Item
              </th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                Categoria
              </th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                Quantidade
              </th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                Status
              </th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                Preço Unit.
              </th>
              <th className="px-8 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aura-charcoal/5">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-aura-soft-gray/30 transition-colors group"
              >
                <td className="px-8 py-4 font-medium text-sm">{item.name}</td>
                <td className="px-8 py-4 text-sm text-aura-charcoal/60">
                  {item.category}
                </td>
                <td className="px-8 py-4 text-sm font-medium">
                  {item.quantity}
                </td>
                <td className="px-8 py-4">
                  {item.quantity <= item.min_quantity ? (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 w-max px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Baixo
                    </span>
                  ) : (
                    <span className="text-aura-sage text-xs font-bold bg-aura-sage/10 w-max px-2 py-1 rounded-full">
                      Normal
                    </span>
                  )}
                </td>
                <td className="px-8 py-4 text-sm text-aura-charcoal/60">
                  R$ {Number(item.unit_price).toFixed(2)}
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setNewItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-aura-charcoal/40 hover:text-aura-gold"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-aura-charcoal/40 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-8 py-12 text-center text-aura-charcoal/40 text-sm"
                >
                  Nenhum item encontrado no estoque.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              <h3 className="text-2xl font-serif italic">
                {selectedItem ? "Editar Produto" : "Novo Produto"}
              </h3>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                      Nome do Produto
                    </label>
                    <input
                      required
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                      Categoria
                    </label>
                    <input
                      required
                      placeholder="Ex: Shampoos, Tinturas..."
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                      value={newItem.category}
                      onChange={(e) =>
                        setNewItem({ ...newItem, category: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                        Quantidade Atual
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                        value={newItem.min_quantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            min_quantity: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                      Preço de Custo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none text-sm"
                      value={newItem.unit_price}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          unit_price: Number(e.target.value),
                        })
                      }
                    />
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
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Salvar Item"
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
