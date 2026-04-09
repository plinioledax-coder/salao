import { supabase } from '../supabase';
import { InventoryItem } from '../../types';

export async function getInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .insert([item])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}