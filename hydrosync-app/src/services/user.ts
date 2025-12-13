import { supabase } from './supabase';

export const deleteAccount = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  // 1. Delete from water_intake table
  const { error: waterIntakeError } = await supabase
    .from('water_intake')
    .delete()
    .eq('user_id', user.id);

  if (waterIntakeError) {
    console.error('Error deleting from water_intake:', waterIntakeError);
    throw new Error(`Failed to delete water intake data: ${waterIntakeError.message}`);
  }

  // 2. Delete from profiles table
  const { error: profilesError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profilesError) {
    console.error('Error deleting from profiles:', profilesError);
    throw new Error(`Failed to delete profile data: ${profilesError.message}`);
  }

  // 3. Delete the user from Supabase auth
  const { error: authError } = await supabase.functions.invoke('delete-user', {
    method: 'POST',
    body: { id: user.id },
  });

  if (authError) {
    console.error('Error deleting user from auth:', authError);
    throw new Error(`Failed to delete user account: ${authError.message}`);
  }

  return { error: null };
};
