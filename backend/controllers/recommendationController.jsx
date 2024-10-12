const Outfit = require('../models/Outfit');

// Sample recommendation logic based on outfit popularity
const getRecommendations = async (req, res) => {
  try {
    const outfits = await Outfit.find().sort({ popularity: -1 }).limit(10); // Top 10 outfits
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error });
  }
};

module.exports = {
  getRecommendations,
};
