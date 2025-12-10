require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client for the backend
const SUPABASE_URL = 'https://cabztuguhbcyzpatctzs.supabase.co'; // Use the same URL as frontend
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // IMPORTANT: Replace with your actual Supabase Service Role Key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false // No session persistence for service role client
    }
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// API endpoint for survey data
app.get('/api/survey-data', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('has_completed_survey, daily_goal_oz, name')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found (new user)
            console.error('Error fetching user survey data from Supabase:', error);
            return res.status(500).json({ error: 'Failed to fetch user data.' });
        }
        res.json(data || { has_completed_survey: false, daily_goal_oz: 0, name: '' });
    } catch (err) {
        console.error('Unexpected error fetching user survey data:', err);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

app.post('/api/user-data', async (req, res) => {
    const { id, name, gender, age, weight, exercise, daily_goal_oz, has_completed_survey } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const { error } = await supabaseAdmin
            .from('users')
            .upsert({
                id,
                name,
                gender,
                age,
                weight,
                exercise,
                daily_goal_oz,
                has_completed_survey
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error upserting user data to Supabase:', error);
            return res.status(500).json({ error: 'Failed to save user data.' });
        }

        res.json({ message: 'User data saved successfully.' });
    } catch (err) {
        console.error('Unexpected error saving user data:', err);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

app.delete('/api/delete-user', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Step 1: Delete user from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
            console.error('Error deleting user from Supabase Auth:', authError);
            return res.status(500).json({ error: 'Failed to delete user from authentication service.' });
        }

        // Step 2: Delete user data from the 'users' table
        const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', userId);
        if (dbError) {
            console.error('Error deleting user data from database:', dbError);
            return res.status(500).json({ error: 'Failed to delete user data.' });
        }

        res.json({ message: 'User account deleted successfully.' });
    } catch (err) {
        console.error('Unexpected error during account deletion:', err);
        res.status(500).json({ error: 'An unexpected error occurred during account deletion.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});