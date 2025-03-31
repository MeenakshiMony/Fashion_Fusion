import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();


// Define the base outfits directory
const outfitsDirectory = path.join(process.cwd(), "outfits");

// Middleware to serve static files
router.use("/outfits", express.static(outfitsDirectory));
console.log("Outfits Directory Path:", outfitsDirectory);


// API to fetch images based on category (tryOnMode)
router.get("/outfits/:tryOnMode", (req, res) => {
  const { tryOnMode } = req.params;

  // Allowed categories
  const validCategories = ["upperbody", "lowerbody", "eyewear"];
  const validExtensions = [".jpg", ".jpeg", ".png"];

  // Check if tryOnMode is valid
  if (!validCategories.includes(tryOnMode)) {
    return res.status(400).json({ error: "Invalid tryOnMode" });
  }

  // Build the category directory path
  const categoryDirectory = path.join(outfitsDirectory, tryOnMode);

  // Check if the directory exists
  if (!fs.existsSync(categoryDirectory)) {
    return res.status(404).json({ error: `Directory for '${tryOnMode}' not found` });
  }

   // Get all images in the category directory
   const images = fs
   .readdirSync(categoryDirectory)
   .filter((file) => validExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
   .map((file) => ({
     name: file,
     url: `${req.protocol}://${req.get("host")}/outfits/${tryOnMode}/${file}`,
   }));

  res.json(images);
});

export default router;
