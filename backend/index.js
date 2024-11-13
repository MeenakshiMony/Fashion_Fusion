import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db/db';  // MongoDB connection from db.js

import { populateDatabase } from './scripts/dbinit';  // Import populateDatabase function
const commentRoutes = require('./routes/CommentRoutes'); 
const postRoutes = require('./routes/PostRoutes');
import userRoutes from './routes/auth'; 

const app = express();
const PORT = 8080;
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Use CORS middleware for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests only from this frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods (optional)
  credentials: true,  // If your frontend uses cookies or authentication tokens
}));

// Use the routes
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api/comments', commentRoutes);

app.listen(PORT , () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) =>
  res.send(`Fashion Fusion Backend is running!`)
)





 