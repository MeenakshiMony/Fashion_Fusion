import mongoose from 'mongoose';
import initializeData from './data.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const connectAndPopulateDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit with failure
    } 
};

const main = async () => {
    await connectAndPopulateDatabase(); // Establish connection to MongoDB
    await initializeData(); // Populate the database with fresh data
    process.exit(0); // Exit gracefully after completion
};

main().catch((error) => {
    console.error('Error initializing database:', error);
    process.exit(1);
});

export default mongoose.connection;
