import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Define the base models directory
const modelsDirectory = path.join(process.cwd(), "models");

/**
 * Recursively fetch all model files from directories
 */
const getModelFiles = (directory, extensions, baseUrl, relativePath = "") => {
  let modelFiles = [];

  if (!fs.existsSync(directory)) return modelFiles;

  fs.readdirSync(directory, { withFileTypes: true }).forEach((file) => {
    const filePath = path.join(directory, file.name);
    const fileRelativePath = path.join(relativePath, file.name);

    if (file.isDirectory()) {
      // Recursively scan subdirectories
      modelFiles = [
        ...modelFiles,
        ...getModelFiles(filePath, extensions, baseUrl, fileRelativePath),
      ];
    } else if (extensions.some((ext) => file.name.endsWith(ext))) {
      // Add model file with full URL
      modelFiles.push({
        name: file.name,
        path: fileRelativePath.replace(/\\/g, "/"), // Normalize path for URLs
        url: `${baseUrl}/models/${fileRelativePath.replace(/\\/g, "/")}`,
      });
    }
  });

  return modelFiles;
};

// Serve static files from "models" and subdirectories
router.use("/models", express.static(modelsDirectory));

// API to list all available 3D models
router.get("/models", (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Fetch models recursively, including GLB, GLTF, FBX, and VRM files
    const modelFiles = getModelFiles(modelsDirectory, [".glb", ".gltf", ".fbx", ".vrm"], baseUrl);

    res.json(modelFiles);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to load models" });
  }
});

export default router;
