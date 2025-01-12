const express = require("express");
const routes = require("./routes");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: "http://localhost:3000", // Replace with your frontend's origin
  methods: "GET,POST,DELETE", // Allowed methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
}));

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
