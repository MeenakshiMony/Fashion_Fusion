import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import db from './db/db';  // MongoDB connection from db.js

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





 