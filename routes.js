const express = require("express");
const cloudinary = require("./config");
const router = express.Router();
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");

// Cloudinary folder name
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "joygardens";

// Middleware to handle file uploads
router.use(
  fileUpload({
    useTempFiles: true, // Enable temporary files
    tempFileDir: "/tmp/", // Temporary directory for files
  })
);

// Route to upload media
router.post("/upload", async (req, res) => {
  try {
    // Check if files exist in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No file uploaded, request files:", req.files);
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Extract uploaded files (can be single or multiple)
    const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];

    // Validate file types (optional)
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: `Unsupported file type: ${file.mimetype}` });
      }
    }

    // Upload each file to Cloudinary
    const uploadResults = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(file.tempFilePath, {
          folder: CLOUDINARY_FOLDER, // Specify Cloudinary target folder
        })
      )
    );

    // Respond with all Cloudinary results
    res.status(200).json({ results: uploadResults });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ message: "Failed to upload media" });
  }
});

// Route to fetch media
router.get("/media", async (req, res) => {
  try {
    // Fetch resources from the specified folder in Cloudinary
    const { resources } = await cloudinary.search
      .expression(`folder:${CLOUDINARY_FOLDER}`)
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();

    res.status(200).json({ resources });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});
// Route to delete media
router.delete("/media/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({ message: "Public ID is required" });
    }

    // Check if the public_id already includes the folder name
    const folderPublicId = public_id.startsWith(CLOUDINARY_FOLDER)
      ? public_id
      : `${CLOUDINARY_FOLDER}/${public_id}`;

    // Delete media from Cloudinary
    const result = await cloudinary.uploader.destroy(folderPublicId);

    if (result.result !== "ok") {
      return res.status(500).json({ message: "Failed to delete media" });
    }

    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
});












// Event Schema
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  imageUrl: String, // To store the image URL
});

const Event = mongoose.model("Event", eventSchema);

// Add Event with Image
router.post("/events", async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image file is required." });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      folder: "joygardens/events",
    });

    // Create the event
    const event = new Event({
      title,
      description,
      date,
      imageUrl: result.secure_url, // Store the image URL
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ message: "Failed to add event." });
  }
});

// Get All Events
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

// Update Event with Image
router.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    const updateData = { title, description, date };

    if (req.files && req.files.image) {
      // Upload new image if provided
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "joygardens/events",
      });
      updateData.imageUrl = result.secure_url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event." });
  }
});

// Delete Event
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event." });
  }
});



module.exports = router;
