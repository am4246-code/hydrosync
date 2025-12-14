import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json', // Added for consistency
};

// Main handler for the Edge Function
serve(async (req: Request) => { // Type for req: Request added for better strictness
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the user ID
    const { id } = await req.json();

    if (!id) {
      throw new Error('User ID is required in the request body.');
    }

    // Initialize Supabase client with service role key
    // This is crucial for performing admin operations like deleting users.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabaseAdmin = createClient(
      supabaseUrl, // SUPABASE_URL from environment variables
      supabaseServiceRoleKey // SUPABASE_SERVICE_ROLE_KEY from environment variables
    );

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (deleteUserError) {
      console.error('Supabase Auth Admin Delete Error:', deleteUserError);
      throw new Error(`Failed to delete user from authentication: ${deleteUserError.message}`);
    }

    // If successful, return a success response
    return new Response(JSON.stringify({ message: 'User deleted successfully from Auth' }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error: any) { // Explicitly catch as any to allow error.message access
    // Log the error using Deno's standard logging (works in Edge Functions)
    console.error('Edge Function Error:', error.message);
    // Create an error response using the Web Response API (supported by Deno Deploy)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: corsHeaders,
        status: 400,
      }
    );
  }
});
