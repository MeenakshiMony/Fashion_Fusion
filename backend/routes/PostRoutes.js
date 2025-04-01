import express from 'express';
const router = express.Router();
import multer from 'multer';
import UserModel from '../model/User';
import PostModel from '../model/Post'; 
import Comment from '../model/Comment';

const upload = multer({ storage: multer.memoryStorage() });

//fetch all posts along with populated comments
router.get('/posts', async (req, res) => {
  try {
    const posts = await PostModel.find().populate({
      path: 'comments', // Populate comments
      populate: {
        path: 'userId', // Further populate user details within comments
        select: 'username', // Select specific fields (e.g., name and email)
      },
    }).populate({
      path: 'userId', // Populate user who created the post
      select: 'username', // Select specific fields from the user
    });
;
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving posts", error: err.message });
  }
});

//fetch post by id
router.get('/posts/:userId', async (req,res) => {
  try{
    const { userId } = req.params;
    const post = await PostModel.find({userId}).sort({ createdAt: -1 });  // Filter posts by userId

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  }
   catch (err) {
    res.status(500).json({ message: "Error retrieving posts", error: err.message })
   }
});

router.post("/addpost", upload.single("image"), async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    console.log("File Data:", req.file);

    const { userId, content, fashionCategory } = req.body;

    // Validate required fields
    if (!userId || !content || !fashionCategory) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Convert the uploaded image to Base64 if it exists
    const imageBase64 = req.file ? req.file.buffer.toString("base64") : null;

    // Create a new post
    const newPost = new PostModel({
      userId,
      content,
      fashionCategory,
      image: imageBase64, // Store the Base64 string in the database
    });

    await newPost.save();
    res.status(201).json({ message: "Post added successfully!", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// POST route to add a new comment to a specific post
router.post('/posts/:id/comments', async (req, res) => {
  const { id } = req.params; 
  const { content, userId } = req.body; 
  try {
    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and userId are required' });
    }

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = new Comment({ content, userId, postId: id });
    await newComment.save();
    post.comments.push(newComment._id);
    await post.save();
    const updatedPost = await PostModel.findById(id).populate({
      path: 'comments', // Populate comments
      populate: {
        path: 'userId', // Further populate user details within comments
        select: 'username', // Select specific fields (e.g., name and email)
      },
    });
    res.status(201).json(updatedPost); 
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

//POST route to add like
router.post('/posts/:id/like', async (req,res) => {
  const { id } = req.params;
  try{
    const post = await PostModel.findById(id);
    if(!post){
      return res.status(404).json({ error: 'Post not found' });
    }
    if(post.likedBy.includes(req.body.userId))
    { // If the user has already liked the post, unlike it
      post.likes -= 1;
      post.likedBy.pull(req.body.userId);
    }
    else{
      // If the user hasn't liked the post, like it
      post.likes += 1;
      post.likedBy.push(req.body.userId);
    }
    await post.save();
    res.status(200).json(post);
  } catch(err) {
    res.status(500).json({ message:'Error liking post', error: err.message })
  }
})

export default router;
