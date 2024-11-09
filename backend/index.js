import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import db from './db/db';  // MongoDB connection from db.js
import { populateDatabase } from './scripts/SeedData';  // Import populateDatabase function
import CommentRoutes from './communityEngagement/routes/CommentRoutes';
import PostRoutes from './communityEngagement/routes/PostRoutes';

const app = express();
const port = 8080;

// Middlewares
app.use(cors('http://localhost:5173')); //frontend url to make connection with frontend

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Fashion_Fusion')
  .then(() => {
    console.log('Database connected');
    
    // Call the function to seed data after DB connection
    populateDatabase();
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

// Routes
app.use('/comments', CommentRoutes);
app.use('/posts', PostRoutes);

// Seed route to trigger manual seeding
app.get('/api/seed', async (req, res) => {
  try {
    await populateDatabase();  // Populate database via API call
    res.status(200).send('Mock data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).send('Error seeding data');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});