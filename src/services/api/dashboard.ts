import { supabase } from '../supabase';
import { Appointment, Customer } from '../../types';

export interface DashboardData {
  todayAppointments: Appointment[];
  birthdays: Customer[];
  // No futuro, podemos trazer as estatísticas reais (receita, qtd agendamentos) daqui
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Busca os agendamentos de hoje
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('*')
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .order('start_time', { ascending: true })
    .limit(5);

  if (apptError) throw new Error(apptError.message);

  // 2. Busca alguns clientes (Simulando aniversariantes para a UI não quebrar)
  // Numa query real, filtraríamos pelo campo birthday batendo com o mês atual
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('*')
    .limit(3);

  if (custError) throw new Error(custError.message);

  return {
    todayAppointments: appointments || [],
    birthdays: customers || []
  };
}