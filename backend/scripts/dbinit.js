import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config(); // Load environment variables

const connectAndPopulateDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } 
};

const main = async () => {
    await connectAndPopulateDatabase(); // Establish connection to MongoDB
    // await initializeData(); // Populate the database with fresh data
};

main().catch((error) => {
    console.error('Error initializing database:', error);
});

export default mongoose.connection;
