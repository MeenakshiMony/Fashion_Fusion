import mongoose from 'mongoose';
import { CommentModel } from "../communityEngagement/model/Comment.js";
import { UserModel } from "../auth/model/User.js";
import { PostModel } from "../communityEngagement/model/Post.js";
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
            console.log('Users inserted successfully', savedUsers);

            // Insert Posts and retrieve their generated IDs
            try {
                // Insert Posts and retrieve their generated IDs
                const savedPosts = await PostModel.insertMany(posts);
                console.log('Posts inserted successfully');
                console.log(JSON.stringify(savedPosts, null, 2));

                // Map post content to their generated IDs for easy lookup
                const postIdMap = {};
                savedPosts.forEach(post => {
                    // Ensure content is a valid key and _id is assigned correctly
                    postIdMap[post.content.trim()] = String(post._id); // Ensure no leading/trailing spaces in content
                });

                // Map `postId` for each comment by matching post content with savedPosts
                const commentsWithPostIds = comments.map(comment => {
                    const relatedPostContent = comment.relatedPostContent?.trim(); // Ensure no spaces or undefined content
                    const postId = postIdMap[relatedPostContent];

                    if (postId) {
                        return { ...comment, postId }; // Assign the found postId to the comment
                    }
                    console.warn(`No matching post found for comment with content: ${relatedPostContent}`);
                    return null; // If no matching post is found
                }).filter(comment => comment !== null); // Filter out unmatched comments

                // Insert Comments with correct postId references
                if (commentsWithPostIds.length > 0) {
                    await CommentModel.insertMany(commentsWithPostIds);
                    console.log('Comments inserted successfully', commentsWithPostIds);
                } else {
                    console.log('No valid comments to insert');
                }

            } catch (error) {
                console.error('Error inserting posts and comments:', error);
            }
        } catch (error) {
            console.error('Error during database population:', error);
        }
    });
};
