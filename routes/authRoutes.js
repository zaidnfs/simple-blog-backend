const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Signup request received:", { name, email, password });

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", userExists);
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Do NOT hash password here, it's already handled in User.js
    const newUser = new User({ name, email, password });

    await newUser.save();
    console.log("User saved to database:", newUser);

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in database
    const user = await User.findOne({ email });
    console.log("User found in database:", user); // ✅ Debugging log

    if (!user) {
      console.log("User does not exist.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match Result:", isMatch); // ✅ Debugging log

    if (!isMatch) {
      console.log("Password comparison failed");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});
// Logout Route (Clear Cookie)
router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});
// 🔹 Get User Profile
// 🔹 Get Logged-in User Profile (Fixed)
router.get("/profile/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🔹 Update User Profile (Protected)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;

module.exports = router;
