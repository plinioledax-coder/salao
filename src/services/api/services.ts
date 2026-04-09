import { supabase } from '../supabase';
import { Service } from '../../types';

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

// Futuramente, podes usar estas para criar um ecrã de "Gestão de Serviços" no teu painel Admin
export async function createService(service: Omit<Service, 'id'>): Promise<Service> {
  const { data, error } = await supabase.from('services').insert([service]).select().single();
  if (error) throw new Error(error.message);
  return data;
}