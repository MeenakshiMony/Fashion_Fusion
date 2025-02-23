import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { populateDatabase } from './scripts/dbinit';  // Import populateDatabase function
import commentRoutes from './routes/CommentRoutes'; 
import postRoutes from './routes/PostRoutes';
import userRoutes from './routes/auth'; 

const app = express();
const PORT = process.env.PORT;
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


//Use CORS middleware for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests only from this frontend URL
  credentials: true,  // If your frontend uses cookies or authentication tokens
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
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

app.get('/avatars', (req, res) => {
  const directoryPath = path.join(__dirname, 'public/avatars');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch files' });
    }
    res.json(files);
  });
});

// Serve static files from the 'models' directory
const modelsDirectory = path.join(__dirname, 'models');
const gltfDirectory = path.join(__dirname, 'gltf'); // Folder for .gltf files
app.use('/models', express.static(modelsDirectory));

app.get('/models', (req, res) => {
  try {
    // Function to get model files from a directory
    const getModelFiles = (directory, extensions) => {
      return fs.existsSync(directory) ? fs.readdirSync(directory)
        .filter(file => extensions.some(ext => file.endsWith(ext)))
        .map(file => ({
          name: file,
          url: `${req.protocol}://${req.get('host')}/${path.basename(directory)}/${file}`
        })) : [];
    };

    // Fetch model files from both directories
    const modelFiles = [
      ...getModelFiles(modelsDirectory, ['.glb', '.bin', '.vrm', '.json']),
      ...getModelFiles(gltfDirectory, ['.gltf'])
    ];

    res.json(modelFiles); // Send the merged list of models
  } catch (error) {
    res.status(500).json({ error: 'Failed to load models' });
  }
});