const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // Use bcryptjs to avoid native module issues
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Ensure cors is required

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Use cors middleware

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sud:DFbmEZc9AwEPZPMd@cluster0.yp7jp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// User Model
const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Debugging statements
    console.log('Signup request body:', req.body);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, email, password: hashedPassword });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Debugging statements
    console.log('Login request body:', req.body);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log('User found:', user);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token, firstName: user.firstName, lastName: user.lastName });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: err.message });
    }
});
// Shirt Schema
const shirtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },  
    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL']
    }
});

// Shirt Model
const Shirt = mongoose.model('Shirt', shirtSchema);

// Routes

// Get all shirts
app.get('/shirts', async (req, res) => {
    try {
        const shirts = await Shirt.find();
        res.json(shirts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new shirt
app.post('/shirts', async (req, res) => {
    const { name, size } = req.body;

    const newShirt = new Shirt({
        name: name,
        size: size
    });

    try {
        const savedShirt = await newShirt.save();
        res.status(201).json(savedShirt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get shirt by ID
app.get('/shirts/:id', async (req, res) => {
    try {
        const shirt = await Shirt.findById(req.params.id);
        if (!shirt) {
            return res.status(404).json({ message: 'Shirt not found' });
        }
        res.json(shirt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a shirt by ID
app.patch('/shirts/:id', async (req, res) => {
    try {
        const { name, size } = req.body;
        const updatedShirt = await Shirt.findByIdAndUpdate(
            req.params.id,
            { name, size },
            { new: true, runValidators: true }
        );
        if (!updatedShirt) {
            return res.status(404).json({ message: 'Shirt not found' });
        }
        res.json(updatedShirt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a shirt by ID
app.delete('/shirts/:id', async (req, res) => {
    try {
        const shirt = await Shirt.findByIdAndDelete(req.params.id);
        if (!shirt) {
            return res.status(404).json({ message: 'Shirt not found' });
        }
        res.json({ message: 'Shirt deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});