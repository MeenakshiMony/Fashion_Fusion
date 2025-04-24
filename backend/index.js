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
import VTON_Images from './routes/VTON_Images_route';

const app = express();

app.options('*', cors());

//Use CORS middleware for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.6:5173'], // Allow requests only from this frontend URL
  credentials: true,  // If your frontend uses cookies or authentication tokens
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

const PORT = process.env.PORT;
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Use the routes
app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);
app.use('/', VTON_Images);

app.listen(PORT , () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) =>
  res.send(`Fashion Fusion Backend is running!`)
)




// Serve 3D models and textures dynamically
app.use("/3dmodel", express.static(path.join(__dirname, "3dmodel")));

// Serve static files from the 'models' directory
const modelsDirectory = path.join(__dirname, 'models');
const gltfDirectory = path.join(__dirname, 'gltf'); // Folder for .gltf files

app.use('/output', express.static(path.join(__dirname, 'output')));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

app.post('/upload', upload.single('outfit'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const outputPath = `output/${Date.now()}.deepar`;

    await createDeepAREffectFromImage(imagePath, outputPath);
    res.json({ deeparFile: outputPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
