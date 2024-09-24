const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 9000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());

// Define User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Add this to your existing Express server code

const products = [
  { id: 1, name: 'FIRE T-SHIRT', description: 'Description for FIRE T-SHIRT', images: ['/Static/ProductImgs/FIRE.jpg', '/Static/ProductImgs/FIRE.jpg', '/Static/ProductImgs/FIRE.jpg', '/Static/ProductImgs/FIRE.jpg'], price: 1999 },
  { id: 2, name: 'FLORAL T-SHIRT', description: 'Description for FLORAL T-SHIRT', images: ['/Static/ProductImgs/FLORAL.jpg', '/Static/ProductImgs/FLORAL.jpg', '/Static/ProductImgs/FLORAL.jpg', '/Static/ProductImgs/FLORAL.jpg'], price: 1999 },
  { id: 3, name: 'LITM T-SHIRT', description: 'Description for LITM T-SHIRT', images: ['/Static/ProductImgs/LIVE.jpg', '/Static/ProductImgs/LIVE.jpg', '/Static/ProductImgs/LIVE.jpg', '/Static/ProductImgs/LIVE.jpg'], price: 1999 },
  { id: 4, name: 'PIGEON T-SHIRT', description: 'Description for PIGEON T-SHIRT', images: ['/Static/ProductImgs/PIGEON.jpg', '/Static/ProductImgs/PIGEON.jpg', '/Static/ProductImgs/PIGEON.jpg', '/Static/ProductImgs/PIGEON.jpg'], price: 1999 },
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email: mongoose.Types.ObjectId(email) });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, firstName, lastName });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error during signup:', err); // Log the error to the console
    res.status(500).json({ message: 'Server error', error: err.message }); // Send the error message in the response
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: mongoose.Types.ObjectId(email) });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});