import bcrypt from 'bcrypt';
import CommentModel from '../model/Comment.js';
import UserModel from '../model/User.js';
import PostModel from '../model/Post.js';

import dotenv from 'dotenv';
dotenv.config();
const baseUrl = process.env.BASE_URL;

// Helper function to hash passwords
const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

// Function to create users with hashed passwords
const createUsers = async () => {
  return [
    { username: 'Anna', email: 'anna@example.com', password: await hashPassword('anna@example.com'), avatar: '${baseUrl}/avatars/avatar_1.png' }, //change the avatar's path in production change it to domain
    { username: 'James', email: 'james@example.com', password: await hashPassword('james@example.com'), avatar: '${baseUrl}/avatars/avatar_2.png' },
    { username: 'Sophia', email: 'sophia@example.com', password: await hashPassword('sophia@example.com'), avatar: '${baseUrl}/avatars/avatar_3.png' },
    { username: 'Lucas', email: 'lucas@example.com', password: await hashPassword('lucas@example.com'), avatar: '${baseUrl}/avatars/avatar_4.png' },
    { username: 'Olivia', email: 'olivia@example.com', password: await hashPassword('olivia@example.com'), avatar: '${baseUrl}/avatars/avatar_6.png' },
    { username: 'Ethan', email: 'ethan@example.com', password: await hashPassword('ethan@example.com') , avatar: '${baseUrl}/avatars/avatar_2.png'},
    { username: 'Lily', email: 'lily@example.com', password: await hashPassword('lily@example.com') ,avatar: '${baseUrl}/avatars/avatar_1.png'},
    { username: 'Mason', email: 'mason@example.com', password: await hashPassword('mason@example.com'), avatar: '${baseUrl}/avatars/avatar_4.png'  }
  ];
};

const createPosts = async (users) => {
  return[
      {
        userId: users[0]._id,
        content: 'Loving my new spring collection! Floral dresses are perfect for sunny days 🌸',
        imageUrl: 'https://www.anunblurredlady.com/wp-content/uploads/2019/02/IMG_9060.jpg',
        likes: 12,
        tags: ['spring', 'floral'],
      },
      {
        userId: users[1]._id,
        content: 'Finally upgraded my wardrobe with a sleek leather jacket. Timeless style for every season 🖤',
        imageUrl: 'https://cdn.shopify.com/s/files/1/0162/2116/files/Leather_jacket_outfits_for_men.jpg?v=1541497705',
        likes: 15,
        tags: ['leather', 'style'],
      },
      {
        userId: users[2]._id,
        content: 'Statement boots for the win! These are the perfect way to add edge to any outfit 👢🔥',
        imageUrl: 'https://2.bp.blogspot.com/-7JWRGLCMYuc/VzIIV1pDTII/AAAAAAAAL6k/4n6zLJcvjHod_8Gm4jtoZJ65ItT26ibzgCLcB/s1600/P5100694.JPG',
        likes: 18,
        tags: ['boots', 'edge'],
      },
      {
        userId: users[3]._id,
        content: 'Sustainable fashion is the future 🌱 Loving my eco-friendly outfit made from recycled materials!',
        imageUrl: 'https://assets.vogue.in/photos/60741d6f0557c4755734dba0/master/w_1600%2Cc_limit/Vogue-Sustainability-Guide-credit-Justin-Polkey-2.jpg',
        likes: 25,
        tags: ['sustainability', 'eco'],
      },
      {
        userId: users[4]._id,
        content: 'My go-to fall outfit: oversized sweater and comfy boots. Perfect for crisp autumn days 🍂',
        imageUrl: 'https://www.wishesandreality.com/wp-content/uploads/2016/10/fall-in-chicago-hm-cable-oversized-turtleneck-sweater-girlfriend-jeans-snakeskin-boots-how-to-wear-over-the-ankle-boots-cozy-fall-style-15.jpg',
        likes: 10,
        tags: ['fall', 'cozy'] ,
      },
      {
        userId: users[5]._id,
        content: 'Nothing beats a classic pair of high-waisted jeans. Effortless chic look every time 👖✨',
        imageUrl: 'https://i.pinimg.com/736x/3f/d4/1d/3fd41d4d95b7f54cc030eba61b195937.jpg',
        likes: 15,
        tags: ['jeans', 'classic'] ,
      },
  
    ];
  
};

const createComments = async (users, posts) => {
  return[
    {  postId: posts[0]._id, userId: users[2]._id, content: "This look is absolutely stunning! 🌟 I love how you styled the floral dress!" },
    {  postId: posts[1]._id, userId: users[5]._id, content: "That leather jacket is such a bold choice! Really elevates the whole outfit 🖤" },
    {  postId: posts[2]._id, userId: users[4]._id, content: "Those boots are fire! 🔥 They really complete the edgy vibe of your outfit 👢" },
    {  postId: posts[3]._id, userId: users[3]._id, content: "Eco-friendly fashion is the way to go! Love how stylish and sustainable your outfit looks 🌱" },
    {  postId: posts[4]._id, userId: users[1]._id, content: "Obsessed with the oversized sweater and boots combo! Perfect for chilly autumn days 🍂" },
    {  postId: posts[5]._id, userId: users[0]._id, content: "High-waisted jeans are such a staple! Definitely need a pair like this in my wardrobe 😍" },
  ];
};

// Export data in an asynchronous way
const initializeData = async () => {
  try {
    console.log('Clearing existing database...');
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommentModel.deleteMany({});
    console.log('Existing data cleared from the database.');

    console.log('Creating users...');
    const users = await createUsers();
    const savedUsers = await UserModel.insertMany(users);
    console.log('Users created successfully.');

    console.log('Creating posts...');
    const posts = await createPosts(savedUsers);
    const savedPosts = await PostModel.insertMany(posts);
    console.log('Posts created successfully.');

    console.log('Creating comments...');
    const commentsData = await createComments(savedUsers, savedPosts); // Ensure this matches the function definition
    await CommentModel.insertMany(commentsData);
    console.log('Comments created successfully.');

    return { users: savedUsers, posts: savedPosts, comments: commentsData };
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error; // Re-throw to handle errors upstream if needed
  }
};


module.exports = initializeData;
