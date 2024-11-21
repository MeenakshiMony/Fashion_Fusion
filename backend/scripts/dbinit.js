import mongoose from 'mongoose';
import CommentModel from '../model/Comment.js';
import UserModel from '../model/User.js';
import PostModel from '../model/Post.js';
import initializeData from './data.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const populateDatabase = async () => {
    try {
        // Clear previous data
        await UserModel.deleteMany({});
        await PostModel.deleteMany({});
        await CommentModel.deleteMany({});
        console.log('Previous data cleared successfully');

        // Initialize data
        const { users, posts, commentsData } = await initializeData();

        // Insert Users
        await UserModel.insertMany(users);
        console.log('Users inserted successfully');

        /* // Insert Posts
        await PostModel.insertMany(posts);
        console.log('Posts inserted successfully');

        // Insert Comments
        await CommentModel.insertMany(comments);
        console.log('Comments inserted successfully'); */

        const savedPosts = await PostModel.insertMany(posts);

        const comments = commentsData.map((comment, index) => {
            const postIndex = index % savedPosts.length;
            return {
                ...comment,
                postId:savedPosts[postIndex]._id,
            };
        });

        const savedComments = await CommentModel.insertMany(comments);

        for(const comment of savedComments) {
            await PostModel.findByIdAndUpdate(comment.postId, {
                $push: { comments: comment._id },
            });
        }

        console.log('Posts and comments initialized successfully');
    } catch (error) {
        console.error('Error during database population:', error);
    }
};

const connectAndPopulateDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');

        // Now populate the database
        await populateDatabase();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } 
};

// Execute the connection and population
connectAndPopulateDatabase();

export default mongoose.connection;
