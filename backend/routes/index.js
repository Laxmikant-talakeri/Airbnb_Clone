const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, // Use environment variables
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file uploads
const upload = multer({ dest: path.join(__dirname, '/tmp') });

// Route for testing
router.get('/', (req, res) => {
  res.status(200).json({
    greeting: 'Hello from airbnb-clone api',
  });
});

// Upload photo using image URL
router.post('/upload-by-link', async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    let result = await cloudinary.uploader.upload(link, {
      folder: 'Airbnb/Places',
    });
    res.status(200).json(result.secure_url);
  } catch (error) {
    console.error('Error uploading by link:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

// Upload images from local device
router.post('/upload', upload.array('photos', 100), async (req, res) => {
  try {
    const imageArray = [];
    for (const file of req.files) {
      const { path } = file;
      let result = await cloudinary.uploader.upload(path, {
        folder: 'Airbnb/Places',
      });
      imageArray.push(result.secure_url);
      fs.unlinkSync(path); // Clean up temporary file
    }
    res.status(200).json(imageArray);
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

// Route imports
router.use('/user', require('./user'));
router.use('/places', require('./place'));
router.use('/bookings', require('./booking'));

module.exports = router;
