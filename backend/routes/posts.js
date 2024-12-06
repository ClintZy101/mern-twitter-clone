const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");

const router = express.Router();



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Missing or malformed token");
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded; // Attach user info
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Create post
router.post("/", async (req, res) => {
  const { email, post } = req.body;
  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Please provide the necessary fields.",
    });
  }
  try {
    const newPost = new Post({ email, post });
    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     const email = req.user.email; // Extract email from the decoded token (attached by the middleware)

//     // Fetch posts associated with the user's email
//     const posts = await Post.find({ email: email });

//     res.status(200).json({ success: true, data: posts });
//   } catch (error) {
//     console.error("Error fetching posts:", error.message);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });

router.get("/", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { post } = req.body;
  
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { post }, // Update the post content
      { new: true } // Return the updated post
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ data: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// // Update post
// router.put('/:id', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const { post } = req.body;

//   try {
//     // Find the post by ID
//     const existingPost = await Post.findById(id);

//     if (!existingPost) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Check if the logged-in user is the author of the post
//     if (existingPost.email !== req.user.email) {
//       return res.status(403).json({ message: "You are not authorized to update this post." });
//     }

//     // Update the post content
//     existingPost.post = post;
//     await existingPost.save();

//     res.status(200).json({ data: existingPost });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating post', error: error.message });
//   }
// });


// Delete a post (DELETE)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});


module.exports = router;
