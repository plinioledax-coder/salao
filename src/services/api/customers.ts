import { supabase } from '../supabase';
import { Customer } from '../../types';

// Busca todos os clientes ordenados por nome
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

// Cria um novo cliente (Omitimos id e created_at pois o banco gera sozinho)
export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Atualiza um cliente existente
export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Deleta um cliente
export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}