import { supabase } from '../supabase';
import { Professional } from '../../types';

export async function getProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createProfessional(professional: Omit<Professional, 'id' | 'created_at'>): Promise<Professional> {
  const { data, error } = await supabase
    .from('professionals')
    .insert([professional])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfessional(id: string, professional: Partial<Professional>): Promise<Professional> {
  const { data, error } = await supabase
    .from('professionals')
    .update(professional)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProfessional(id: string): Promise<void> {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}