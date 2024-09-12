// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sud:DFbmEZc9AwEPZPMd@cluster0.yp7jp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

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