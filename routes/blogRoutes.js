const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all blogs (Public)
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get a single blog post by ID (Public)
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🔒 Create a new blog post (Protected)
router.post("/blogs", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newBlog = new Blog({ title, content });
    await newBlog.save();

    res.status(201).json({ message: "Blog post created successfully", blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog post", error: error.message });
  }
});

// 🔒 Delete a blog post (Protected)
router.delete("/blogs/:id", authMiddleware, async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🔒 Update a blog post (Protected)
router.put("/blogs/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// 🔹 Add Comment to Blog
router.post("/blogs/:id/comments", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = {
      user: req.user.id,
      text: req.body.text,
    };

    blog.comments.push(comment);
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🔹 Get Comments for a Blog
router.get("/blogs/:id/comments", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("comments.user", "name avatar"); // ✅ Include avatar
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog.comments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
