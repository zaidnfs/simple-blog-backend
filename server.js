const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // For handling cookies
require("dotenv").config();

const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes"); // Import authentication routes

const app = express();

// ✅ Updated CORS configuration
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://simple-blog-frontend-2ujgq0jnz-md-zaid-alams-projects-d5d0e8eb.vercel.app" // Deployed frontend on Vercel
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // Allow cookies
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Enable cookies for JWT authentication

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api", blogRoutes);
app.use("/api/auth", authRoutes); // Add authentication routes

// Test route
app.get("/api/test", (req, res) => {
  console.log("✅ Test route hit");
  res.json({ message: "Test route works!" });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack); // Log the error
  res.status(500).json({ message: "❌ Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
