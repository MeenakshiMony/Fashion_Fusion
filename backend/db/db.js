import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/Fashion_Fusion');

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('Connection error:', error);
});

db.once('open', () => {
    console.log('Database connection established successfully!');
});

export default db;