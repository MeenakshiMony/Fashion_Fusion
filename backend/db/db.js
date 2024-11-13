import mongoose, {mongo} from 'mongoose';
import { populateDatabase } from '../scripts/dbinit';
require('dotenv').config();  

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.error(err));

const db = mongoose.connection;

populateDatabase();

export default db;