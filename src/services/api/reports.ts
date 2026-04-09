import { supabase } from '../supabase';

export interface ReportData {
  performanceData: { name: string; revenue: number; expenses: number }[];
  serviceDistribution: { name: string; value: number }[];
  stats: {
    averageTicket: number;
    cancellationRate: number;
    totalAppointments: number;
  };
}

export async function getReportData(): Promise<ReportData> {
  // 1. Buscar transações para o gráfico de barras
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*');

  if (txError) throw new Error(txError.message);

  // 2. Buscar agendamentos para o gráfico de pizza e KPIs
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('*');

  if (apptError) throw new Error(apptError.message);

  // --- Agrupamento de Receitas e Despesas por Mês ---
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const perfMap = new Map<string, { revenue: number; expenses: number }>();
  
  // Inicializar os últimos 6 meses (para simplificar o exemplo)
  const currentMonthIndex = new Date().getMonth();
  for (let i = 5; i >= 0; i--) {
    let m = currentMonthIndex - i;
    if (m < 0) m += 12;
    perfMap.set(months[m], { revenue: 0, expenses: 0 });
  }

  transactions?.forEach(tx => {
    const txMonth = months[new Date(tx.date).getMonth()];
    if (perfMap.has(txMonth)) {
      const current = perfMap.get(txMonth)!;
      if (tx.type === 'income') current.revenue += Number(tx.amount);
      else current.expenses += Number(tx.amount);
    }
  });

  const performanceData = Array.from(perfMap, ([name, values]) => ({ name, ...values }));

// --- Distribuição de Serviços (Gráfico de Pizza) ---
  const distMap = new Map<string, number>();
  appointments?.forEach(appt => {
    if (appt.status === 'completed') {
      // Se não tiver nome do serviço, usa um fallback para não sumir do gráfico
      const name = appt.service_name || 'Serviço não informado';
      const count = distMap.get(name) || 0;
      distMap.set(name, count + 1);
    }
  });
  const serviceDistribution = Array.from(distMap, ([name, value]) => ({ name, value }));

  // --- KPIs ---
  const completedAppts = appointments?.filter(a => a.status === 'completed') || [];
  const cancelledAppts = appointments?.filter(a => a.status === 'cancelled' || a.status === 'no_show') || [];
  
  const totalRevenue = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const averageTicket = completedAppts.length > 0 ? (totalRevenue / completedAppts.length) : 0;
  const cancellationRate = appointments && appointments.length > 0 
    ? (cancelledAppts.length / appointments.length) * 100 
    : 0;

  return {
    performanceData,
    serviceDistribution,
    stats: {
      averageTicket,
      cancellationRate,
      totalAppointments: appointments?.length || 0
    }
  };
}