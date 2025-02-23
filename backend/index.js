import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 80;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save uploaded files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  }
});

const upload = multer({ storage: storage });

// Endpoint to handle image upload and recommendation
app.post('/recommend', upload.single('image'), (req, res) => {
  console.log("Request received at /recommend");
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).send('No file uploaded.');
  }
  console.log("File uploaded:", req.file);

  const imagePath = path.join(__dirname, req.file.path);

  // Call the Python script
  const pythonProcess = spawn('python3', ['fashion_recommendation.py', imagePath]);

  let dataToSend = '';

  pythonProcess.stdout.on('data', (data) => {
    dataToSend += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send('Error processing the image.');
    }

    // Parse the output from the Python script
    try {
      const recommendations = JSON.parse(dataToSend);
      res.json(recommendations);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      res.status(500).send("Error parsing recommendations.");
    }
  });
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from this frontend URL
  credentials: true,  // If your frontend uses cookies or authentication tokens
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Default route
app.get('/', (req, res) =>
  res.send(`Fashion Fusion Backend is running!`)
);