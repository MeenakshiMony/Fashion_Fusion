const express = require('express');
const { uploadImage, tryOnOutfit } = require('../controllers/arController');
const multer = require('multer');
const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files to 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
    },
});

const upload = multer({ storage });

// Route to handle avatar image uploads
router.post('/upload', upload.single('avatar'), uploadImage);

// Route to handle AR outfit selection and try-on logic
router.post('/try-on', tryOnOutfit);

module.exports = router;
