const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const users = []; // This should be replaced with a proper database in a real application

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = { email, password: hashedPassword, firstName, lastName };
  users.push(newUser);

  res.status(201).json({ message: 'User created successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Generate JWT
  const token = jwt.sign({ email: user.email, firstName: user.firstName, lastName: user.lastName }, 'your_jwt_secret', { expiresIn: '1h' });

  res.status(200).json({ token, firstName: user.firstName, lastName: user.lastName });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});