import mongoose from 'mongoose';
const CommentModel = require('../model/Comment');
const UserModel = require('../model/User.js');
const PostModel = require('../model/Post.js');
import initializeData from './data.js';

export const populateDatabase = async () => {
    const db = mongoose.connection;

    db.on('error', (error) => {
        console.error(error);
    });

    db.once('open', async () => {
        console.log('Database connection open');

        try {
            // Clear previous data
            await UserModel.deleteMany({});
            await PostModel.deleteMany({});
            await CommentModel.deleteMany({});
            console.log('Previous data cleared successfully');

            // Initialize data
            const { users, posts, comments } = await initializeData();

            // Insert Users
            const savedUsers = await UserModel.insertMany(users);
            console.log('Users inserted successfully');

            try {
                // Insert Posts
                const savedPosts = await PostModel.insertMany(posts);
                console.log('Posts inserted successfully');

                // Insert Comments
                const savedComments = await CommentModel.insertMany(comments);
                console.log('Comments inserted successfully');

            } catch (error) {
                console.error('Error inserting posts or comments', error);
            }

        } catch (error) {
            console.error('Error during database population:', error);
        }
    });
};
