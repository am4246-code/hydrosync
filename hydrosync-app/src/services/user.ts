import { supabase } from './supabase';

/**
 * Fetches the user's email from the 'user_emails' table.
 * This is used to display the email in the frontend, linked by user ID.
 * @param userId The UUID of the user.
 * @returns The user's email as a string, or null if not found or an error occurs.
 */
export const getUserEmail = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_emails')
    .select('email')
    .eq('id', userId)
    .single();

  // PGRST116 is a specific Supabase PostgREST error code indicating "no rows found".
  // We handle this gracefully by returning null, as it means the email hasn't been added yet for the user.
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user email:', error);
    return null;
  }

  return data ? data.email : null;
};
