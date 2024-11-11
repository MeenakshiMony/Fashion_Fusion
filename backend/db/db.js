import mongoose, {mongo} from 'mongoose';
import { populateDatabase } from '../scripts/dbinit';
require('dotenv').config();  

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database connected"))
    .catch(err => console.error(err));

const db = mongoose.connection;

db.on('error', (error) => {
    console.error(error);
});

db.once('open', () => {
    console.log('Database connection established successfully!');
});

populateDatabase();

export default db;