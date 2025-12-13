## Edge Function Setup Instructions

The "delete account" feature is failing because it relies on a Supabase Edge Function that has not been deployed. I have created the necessary function code for you in the `supabase/functions/delete-user` directory.

To deploy this function and fix the "delete account" feature, please follow these steps:

1.  **Install the Supabase CLI:** If you haven't already, install the Supabase CLI by following the instructions here: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

2.  **Link your project:** Open a terminal in the root of this project (`hydrosync website`) and run the following command, replacing `[YOUR-PROJECT-ID]` with your actual Supabase project ID (you can find this in your Supabase project's URL: `https://app.supabase.com/project/[YOUR-PROJECT-ID]`):

    ```bash
    supabase link --project-ref [YOUR-PROJECT-ID]
    ```

3.  **Deploy the function:** After linking your project, deploy the `delete-user` function with this command:

    ```bash
    supabase functions deploy delete-user
    ```

4.  **Set environment variables:** The Edge Function needs access to your Supabase project's URL and service role key. Set these as environment variables for your function:

    ```bash
    supabase secrets set SUPABASE_URL=[YOUR-SUPABASE-URL]
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[YOUR-SUPABASE-SERVICE-ROLE-KEY]
    ```
    
    Replace `[YOUR-SUPABASE-URL]` with your project's URL (e.g., `https://xxxxxx.supabase.co`) and `[YOUR-SUPABASE-SERVICE-ROLE-KEY]` with your project's `service_role` key (you can find this in your Supabase project dashboard under `Settings` > `API`).

After completing these steps, the "Delete Account" button should work as expected.
