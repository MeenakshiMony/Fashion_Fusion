const path = require('path');

// Controller to handle image upload
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    return res.json({ fileUrl });
};

// Controller to handle AR outfit selection
const tryOnOutfit = (req, res) => {
    try {
        const { outfitId, arViewerUrl } = req.body;

        // Logic to integrate outfit with AR (this can vary depending on your AR tech)
        // Example: update the AR viewer with the selected outfit
        const updatedViewerUrl = `${arViewerUrl}?outfit=${outfitId}`; // Example logic

        // Respond with the updated AR viewer URL
        res.status(200).json({ updatedViewerUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error applying outfit to AR viewer' });
    }
};

module.exports = {
    uploadImage,
    tryOnOutfit
};
