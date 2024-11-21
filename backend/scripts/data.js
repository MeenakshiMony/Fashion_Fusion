const bcrypt = require('bcrypt');

// Helper function to hash passwords
const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

// Function to create users with hashed passwords
const createUsers = async () => {
  return [
    { username: 'Anna', email: 'anna@example.com', password: await hashPassword('anna@example.com') },
    { username: 'James', email: 'james@example.com', password: await hashPassword('james@example.com') },
    { username: 'Sophia', email: 'sophia@example.com', password: await hashPassword('sophia@example.com') },
    { username: 'Lucas', email: 'lucas@example.com', password: await hashPassword('lucas@example.com') },
    { username: 'Olivia', email: 'olivia@example.com', password: await hashPassword('olivia@example.com') },
    { username: 'Ethan', email: 'ethan@example.com', password: await hashPassword('ethan@example.com') },
    { username: 'Lily', email: 'lily@example.com', password: await hashPassword('lily@example.com') },
    { username: 'Mason', email: 'mason@example.com', password: await hashPassword('mason@example.com') }
  ];
};

// Export data in an asynchronous way
const initializeData = async () => {
  const users = await createUsers();

  const posts = [
    {
      user: 'Anna',
      content: 'Loving my new spring collection! Floral dresses are perfect for sunny days 🌸',
      imageUrl: 'https://www.anunblurredlady.com/wp-content/uploads/2019/02/IMG_9060.jpg',
      likes: 12,
    },
    {
      user: 'James',
      content: 'Finally upgraded my wardrobe with a sleek leather jacket. Timeless style for every season 🖤',
      imageUrl: 'https://cdn.shopify.com/s/files/1/0162/2116/files/Leather_jacket_outfits_for_men.jpg?v=1541497705',
      likes: 15,
    },
    {
      user: 'Lucas',
      content: 'Statement boots for the win! These are the perfect way to add edge to any outfit 👢🔥',
      imageUrl: 'https://2.bp.blogspot.com/-7JWRGLCMYuc/VzIIV1pDTII/AAAAAAAAL6k/4n6zLJcvjHod_8Gm4jtoZJ65ItT26ibzgCLcB/s1600/P5100694.JPG',
      likes: 18,
    },
    {
      user: 'Olivia',
      content: 'Sustainable fashion is the future 🌱 Loving my eco-friendly outfit made from recycled materials!',
      imageUrl: 'https://assets.vogue.in/photos/60741d6f0557c4755734dba0/master/w_1600%2Cc_limit/Vogue-Sustainability-Guide-credit-Justin-Polkey-2.jpg',
      likes: 25,
    },
    {
      user: 'Ethan',
      content: 'My go-to fall outfit: oversized sweater and comfy boots. Perfect for crisp autumn days 🍂',
      imageUrl: 'https://www.wishesandreality.com/wp-content/uploads/2016/10/fall-in-chicago-hm-cable-oversized-turtleneck-sweater-girlfriend-jeans-snakeskin-boots-how-to-wear-over-the-ankle-boots-cozy-fall-style-15.jpg',
      likes: 10,
    },
    {
      user: 'Sophia',
      content: 'Nothing beats a classic pair of high-waisted jeans. Effortless chic look every time 👖✨',
      imageUrl: 'https://i.pinimg.com/736x/3f/d4/1d/3fd41d4d95b7f54cc030eba61b195937.jpg',
      likes: 15,
    },

  ];

  const commentsData = [
    {  user: "Anna", content: "This look is absolutely stunning! 🌟 I love how you styled the floral dress!" },
    {  user: "James", content: "That leather jacket is such a bold choice! Really elevates the whole outfit 🖤" },
    {  user: "Lucas", content: "Those boots are fire! 🔥 They really complete the edgy vibe of your outfit 👢" },
    {  user: "Olivia", content: "Eco-friendly fashion is the way to go! Love how stylish and sustainable your outfit looks 🌱" },
    {  user: "Ethan", content: "Obsessed with the oversized sweater and boots combo! Perfect for chilly autumn days 🍂" },
    {  user: "Sophia", content: "High-waisted jeans are such a staple! Definitely need a pair like this in my wardrobe 😍" },
  ];
  


  return { users, posts, commentsData };
};

module.exports = initializeData;
