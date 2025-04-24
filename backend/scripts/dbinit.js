import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GridFSBucket } from 'mongodb';

dotenv.config(); // Load environment variables

let gfs; // GridFSBucket reference

const connectAndPopulateDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Initialize GridFS immediately after connection
        const conn = mongoose.connection;
        gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
        console.log('GridFS initialized with bucket: uploads');

        console.log('Database connected successfully');
        return conn; // Return connection for optional use    
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

export { mongoose, gfs };
