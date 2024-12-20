import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import { populateDatabase } from './scripts/dbinit';  // Import populateDatabase function
import commentRoutes from './routes/CommentRoutes'; 
import postRoutes from './routes/PostRoutes';
import userRoutes from './routes/auth'; 

const app = express();
const PORT = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Use CORS middleware for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests only from this frontend URL
  credentials: true,  // If your frontend uses cookies or authentication tokens
}));

// Use the routes
app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);

app.listen(PORT , () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) =>
  res.send(`Fashion Fusion Backend is running!`)
)

// Serve static files from the "public" folder
app.use('/avatars', express.static('public/avatars'));

// Serve static files from the 'models' directory
const modelsDirectory = path.join(__dirname, 'models');
app.use('/models', express.static(modelsDirectory));

// API endpoint to get the list of all models with their URLs
app.get('/models', (req, res) => {
  fs.readdir(modelsDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read models directory' });
    }

    // Filter model files (supports .glb and .bin extensions)
    const modelFiles = files.filter(file => file.endsWith('.glb') || file.endsWith('.bin'));

    // Generate a list of URLs for the models
    const modelUrls = modelFiles.map(file => {
      return {
        name: file,
        url: `${req.protocol}://${req.get('host')}/models/${file}` // Generates full URL to the model
      };
    });

    res.json(modelUrls); // Return the list of model URLs
  });
});
 