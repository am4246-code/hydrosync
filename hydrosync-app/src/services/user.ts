import { supabase } from './supabase';

export const getUserEmail = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_emails')
    .select('email')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching user email:', error);
    return null;
  }

  return data ? data.email : null;
};
