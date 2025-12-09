require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
