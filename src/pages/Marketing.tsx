import React, { useState, useEffect } from "react";
import {
  getMarketingStats,
  CampaignStats,
  getTargetEmails,
} from "../services/api/marketing";
import {
  Megaphone,
  Send,
  Users,
  Sparkles,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../utils/cn";

export function Marketing() {
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [campaign, setCampaign] = useState({
    title: "",
    message: "",
    target: "all" as "all" | "vip" | "inactive",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getMarketingStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar marketing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLaunchCampaign = async () => {
    if (!campaign.title || !campaign.message) return;

    setIsSending(true);
    try {
      // Aqui o sistema busca a lista de e-mails/telefones reais do segmento
      const targets = await getTargetEmails(campaign.target);
      console.log(`Disparando campanha para ${targets.length} clientes...`);

      // Simula o delay do envio
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setCampaign({ title: "", message: "", target: "all" });
    } catch (error) {
      alert("Erro ao disparar campanha.");
    } finally {
      setIsSending(false);
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
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-aura-gold/10 text-aura-gold">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif italic">Nova Campanha</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">
                  Título da Campanha
                </label>
                <input
                  placeholder="Ex: Promoção de Outono"
                  className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-aura-gold/20 transition-all"
                  value={campaign.title}
                  onChange={(e) =>
                    setCampaign({ ...campaign, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-aura-charcoal/40 font-bold">
                  Mensagem
                </label>
                <textarea
                  placeholder="Escreva a sua mensagem para os clientes..."
                  className="w-full bg-aura-soft-gray border-none rounded-xl px-4 py-3 outline-none h-32 resize-none focus:ring-2 ring-aura-gold/20 transition-all"
                  value={campaign.message}
                  onChange={(e) =>
                    setCampaign({ ...campaign, message: e.target.value })
                  }
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleLaunchCampaign}
                  disabled={isSending || !campaign.title || !campaign.message}
                  className="aura-button aura-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Lançar Campanha
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-aura-sage/10 border border-aura-sage text-aura-sage rounded-2xl flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Campanha enviada com sucesso para a fila de processamento!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 bg-aura-charcoal text-white relative overflow-hidden">
            <Sparkles className="w-8 h-8 mb-4 text-aura-gold" />
            <h4 className="text-xl font-serif italic mb-2">Dica do Studio</h4>
            <p className="text-sm opacity-80 leading-relaxed font-light italic">
              "Clientes que recebem lembretes de agendamento têm 40% menos
              chances de faltar. Use as campanhas VIP para recompensar a
              fidelidade."
            </p>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h4 className="text-lg font-serif italic">Público Alvo</h4>
            <div className="space-y-3">
              {[
                {
                  id: "all",
                  label: "Todos os Clientes",
                  count: stats?.totalCustomers || 0,
                  icon: Users,
                },
                {
                  id: "inactive",
                  label: "Inativos (+30 dias)",
                  count: stats?.inactiveCustomers || 0,
                  icon: MessageSquare,
                },
                {
                  id: "vip",
                  label: "Clientes VIP",
                  count: stats?.vipCustomers || 0,
                  icon: Sparkles,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setCampaign({ ...campaign, target: t.id as any })
                  }
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                    campaign.target === t.id
                      ? "border-aura-gold bg-aura-gold/5 shadow-sm"
                      : "border-aura-charcoal/5 hover:border-aura-gold/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <t.icon
                      className={cn(
                        "w-4 h-4",
                        campaign.target === t.id
                          ? "text-aura-gold"
                          : "text-aura-charcoal/40 group-hover:text-aura-gold",
                      )}
                    />
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  <span className="text-xs font-bold text-aura-charcoal/40">
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
