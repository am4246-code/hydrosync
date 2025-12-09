require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// New API endpoint for survey data
app.get('/api/survey-data', (req, res) => {
    // In a real application, this would fetch data from a database (e.g., Supabase)
    // For now, return some dummy data
    res.json({
        name: 'John Doe',
        gender: 'male',
        age: 30,
        weight: 180,
        exercise: 'moderate',
        goalIntake: 120
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});