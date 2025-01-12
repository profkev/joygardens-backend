const express = require("express");
const routes = require("./routes");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Determine allowed origin dynamically
const allowedOrigins = [
  "http://localhost:3000", // Local development frontend
  "https://joygardens.vercel.app" // Your hosted frontend domain

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
    methods: "GET,POST,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allowed HTTP headers
  })
);

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
