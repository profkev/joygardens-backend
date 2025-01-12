const express = require("express");
const mongoose = require("mongoose"); // Import mongoose for MongoDB connection
const routes = require("./routes");
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");


const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:1233@cluster0.suf6q.mongodb.net/joygarden";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Determine allowed origin dynamically
const allowedOrigins = [
  "http://localhost:3000", // Local development frontend
  "https://joygardens.vercel.app", // Your hosted frontend domain
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg = "The CORS policy does not allow access from this origin.";
        return callback(new Error(msg), false);
      }
    },
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allowed HTTP headers
  })
);

// Middleware for parsing JSON
app.use(express.json());

// API Routes
app.use("/api", routes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
