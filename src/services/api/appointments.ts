import { supabase } from '../supabase';
import { Appointment, AppointmentStatus } from '../../types';

export async function getAppointments(startDate: Date, endDate: Date): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Lógica de Fidelidade: Se concluído, poderíamos chamar uma função RPC ou lógica aqui.
  // Como sugestão sénior, no futuro isto deve ser um Trigger no Postgres.
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}