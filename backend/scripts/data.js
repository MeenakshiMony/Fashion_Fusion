const bcrypt = require('bcrypt');

// Helper function to hash passwords
const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

// Function to create users with hashed passwords
const createUsers = async () => {
  return [
    { username: 'Joe', email: 'joe@example.com', password: await hashPassword('password1') },
    { username: 'Charlie', email: 'charlie@example.com', password: await hashPassword('password2') },
    { username: 'Simon', email: 'simon@example.com', password: await hashPassword('password3') },
    { username: 'Teresa', email: 'teresa@example.com', password: await hashPassword('password4') },
    { username: 'Sara', email: 'sara@example.com', password: await hashPassword('password5') },
    { username: 'Dalton', email: 'dalton@example.com', password: await hashPassword('password6') },
    { username: 'Sandy', email: 'sandy@example.com', password: await hashPassword('password7') },
    { username: 'Ambreen', email: 'ambreen@example.com', password: await hashPassword('password8') }
  ];
};

// Export data in an asynchronous way
const initializeData = async () => {
  const users = await createUsers();

  const posts = [
    {
      user: 'Joe',
      content: 'This is a post about my trip to Vancouver!',
      imageUrl: 'https://www.tripsavvy.com/thmb/ArdxvzH0AQAkmDKpRHraiu1buj4=/960x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-534612574-5b11609743a10300368c9314.jpg',
      likes: 5,
    },
    {
      user: 'Sara',
      content: 'Had a great time in NYC!',
      imageUrl: 'https://example.com/images/nyc.jpg',
      likes: 3,
    },
    {
      user: 'Simon',
      content: 'Had an amazing day in Boston.',
      imageUrl: 'https://tempusfugitlaw.com/wp-content/uploads/2021/02/Tempus_Law_Home-e1616513096985.jpg',
      likes: 2,
    }
  ];
  

  const comments = [
    { user: "Joe", content: "This is amazing!" },
    { user: "Charlie", content: "So cool!" },
    { user: "Sara", content: "I want to try this!" }
  ];

  return { users, posts, comments };
};

module.exports = initializeData;
