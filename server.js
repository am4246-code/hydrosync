const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('.'));

const dbFile = 'db.json';

// Helper function to read the database
const readDB = () => {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ users: [] }));
  }
  const data = fs.readFileSync(dbFile);
  return JSON.parse(data);
};

// Helper function to write to the database
const writeDB = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

// Registration endpoint
app.post('/register', async (req, res) => {
  console.log('Received request on /register');
  const { email, password } = req.body;
  const db = readDB();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const existingUser = db.users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: db.users.length + 1, email, password: hashedPassword };
  db.users.push(newUser);
  writeDB(db);

  res.status(201).json({ message: 'User registered successfully.' });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  // In a real application, you would return a token (e.g., JWT)
  res.status(200).json({ message: 'Login successful.' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
