import React, { useState, useEffect } from "react";
import { getReportData, ReportData } from "../services/api/reports";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#36454F",
  "#8A9A5B",
  "#D4AF37",
  "#B87333",
  "#A0522D",
  "#7B8E9B",
  "#D2B48C",
];

export function Reports() {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReportData();
        setReportData(data);
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [timeRange]);

  const handleExportPDF = () => {
    window.print();
  };

  if (loading || !reportData) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-aura-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-10 print:m-0 print:p-0 print:space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif italic">
            Relatórios de Desempenho
          </h3>
          <p className="text-sm text-aura-charcoal/40 print:hidden">
            Análise detalhada do seu negócio
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <select
            className="bg-white border border-aura-charcoal/10 rounded-full px-4 py-2 text-sm outline-none cursor-pointer"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <button
            onClick={handleExportPDF}
            className="aura-button aura-button-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-8">
        <div className="lg:col-span-2 glass-card p-8 print:border-none print:shadow-none print:p-0">
          <h4 className="text-lg font-serif mb-8 italic">
            Receita vs Despesas
          </h4>
          <div className="h-[350px] w-full">
            <div style={{ width: "100%", height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.performanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee"
                  />
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
                  <Bar
                    dataKey="revenue"
                    fill="#8A9A5B"
                    radius={[4, 4, 0, 0]}
                    name="Receita"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#B87333"
                    radius={[4, 4, 0, 0]}
                    name="Despesas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col print:border-none print:shadow-none print:p-0">
          <h4 className="text-lg font-serif mb-8 italic">
            Serviços Concluídos
          </h4>
          <div className="flex-1 h-[300px] w-full">
            <div style={{ width: "100%", height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.serviceDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportData.serviceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {reportData.serviceDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></div>
                <span className="text-xs font-medium">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
            {reportData.serviceDistribution.length === 0 && (
              <p className="col-span-2 text-center text-xs text-aura-charcoal/40">
                Nenhum serviço concluído.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        {[
          {
            label: "Ticket Médio",
            value: `R$ ${reportData.stats.averageTicket.toFixed(2)}`,
            icon: TrendingUp,
            color: "text-aura-sage",
          },
          {
            label: "Total Agendamentos",
            value: reportData.stats.totalAppointments,
            icon: CalendarIcon,
            color: "text-aura-gold",
          },
          {
            label: "Cancelamentos",
            value: `${reportData.stats.cancellationRate.toFixed(1)}%`,
            icon: TrendingDown,
            color: "text-red-400",
          },
          {
            label: "Ocupação (Est.)",
            value: "82%",
            icon: Users,
            color: "text-aura-clay",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 print:border-none print:shadow-none print:bg-aura-soft-gray/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color} print:hidden`} />
              <p className="text-[10px] uppercase tracking-widest text-aura-charcoal/40">
                {stat.label}
              </p>
            </div>
            <p className="text-2xl font-serif">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
