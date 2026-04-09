import { supabase } from '../supabase';
import { Appointment, AppointmentStatus } from '../../types';
import { createTransaction } from './finance';

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

export async function createAppointment(appointment: any): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAppointmentFull(id: string, updates: Partial<any>): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);

  // MÁGICA DO CRM: Se concluiu o serviço...
  if (updates.status === 'completed') {
    let customerId = updates.customer_id;

    // 1. Se o agendamento não tem um ID de cliente atrelado, vamos procurar ou criar!
    if (!customerId && updates.customer_name) {
      // Tenta achar o cliente pelo nome ou telefone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .or(`name.ilike.${updates.customer_name},phone.eq.${updates.customer_phone}`)
        .limit(1)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // NÃO EXISTE? Cria automaticamente na base de clientes!
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert([{
            name: updates.customer_name,
            phone: updates.customer_phone || '',
            email: updates.customer_email || '',
            birthday: updates.customer_birthday || ''
          }])
          .select()
          .single();
          
        if (newCustomer) customerId = newCustomer.id;
      }

      // Atualiza o agendamento com o ID do cliente para o histórico do CRM funcionar
      if (customerId) {
        await supabase.from('appointments').update({ customer_id: customerId }).eq('id', id);
      }
    }

    // 2. Gera o Financeiro
    await createTransaction({
      description: `Serviço: ${updates.customer_name || 'Cliente'}`,
      amount: updates.price || 0,
      type: 'income',
      category: 'Serviços',
      date: new Date().toISOString()
    });

    // 3. Dá os pontos de fidelidade
    if (customerId) {
       await supabase.rpc('increment_loyalty_points', { cust_id: customerId, points: 10 });
    }
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}