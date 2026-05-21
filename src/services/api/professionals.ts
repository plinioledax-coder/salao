import { supabase } from '../supabase';
import { Professional, Appointment } from '../../types';

// Estendemos o tipo base para incluir as novidades
export interface ProfessionalData extends Professional {
  commission_rate: number;
  specialties: string[];
  active: boolean;
}

export async function getProfessionals(includeInactive = false): Promise<ProfessionalData[]> {
  let query = supabase.from('professionals').select('*').order('name', { ascending: true });
  
  if (!includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createProfessional(professional: Partial<ProfessionalData>): Promise<ProfessionalData> {
  const safePayload = { ...professional };
  delete safePayload.id;
  // @ts-ignore
  delete safePayload.created_at;

  const { data, error } = await supabase
    .from('professionals')
    .insert([safePayload])
    .select()
    .single();

  if (error) {
    if (error.message.includes("off_days") || error.details?.includes("off_days") || error.message.includes("PGRST204")) {
      const fallbackPayload = { ...safePayload };
      delete fallbackPayload.off_days;
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('professionals')
        .insert([fallbackPayload])
        .select()
        .single();
        
      if (fallbackError) throw new Error(fallbackError.message);
      throw new Error("COLUMN_OFF_DAYS_MISSING");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function updateProfessional(id: string, updates: Partial<ProfessionalData>): Promise<void> {
  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  // @ts-ignore
  delete safeUpdates.created_at;

  const { error } = await supabase
    .from('professionals')
    .update(safeUpdates)
    .eq('id', id);

  if (error) {
    if (error.message.includes("off_days") || error.details?.includes("off_days") || error.message.includes("PGRST204")) {
      const fallbackUpdates = { ...safeUpdates };
      delete fallbackUpdates.off_days;
      
      const { error: fallbackError } = await supabase
        .from('professionals')
        .update(fallbackUpdates)
        .eq('id', id);
        
      if (fallbackError) throw new Error(fallbackError.message);
      throw new Error("COLUMN_OFF_DAYS_MISSING");
    }
    throw new Error(error.message);
  }
}

// --- DASHBOARD INDIVIDUAL DO PROFISSIONAL ---
export interface ProfDashboardStats {
  totalRevenue: number;
  totalAttendances: number;
  averageTicket: number;
  upcoming: Appointment[];
}

export async function getProfessionalDashboard(profId: string): Promise<ProfDashboardStats> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // 1. Buscar agendamentos do mês atual para estatísticas
  const { data: monthAppts, error: err1 } = await supabase
    .from('appointments')
    .select('*')
    .eq('professional_id', profId)
    .gte('start_time', firstDayOfMonth)
    .lte('start_time', lastDayOfMonth);

  if (err1) throw new Error(err1.message);

  const completed = monthAppts?.filter(a => a.status === 'completed') || [];
  const totalRevenue = completed.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const totalAttendances = completed.length;
  const averageTicket = totalAttendances > 0 ? totalRevenue / totalAttendances : 0;

  // 2. Buscar próximos 5 agendamentos (Pendentes ou Confirmados)
  const { data: upcoming, error: err2 } = await supabase
    .from('appointments')
    .select('*')
    .eq('professional_id', profId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('start_time', now.toISOString())
    .order('start_time', { ascending: true })
    .limit(5);

  if (err2) throw new Error(err2.message);

  return {
    totalRevenue,
    totalAttendances,
    averageTicket,
    upcoming: upcoming || []
  };
}