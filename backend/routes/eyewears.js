const express = require("express");
const router = express.Router();

const baseUrl = "http://localhost:8080";

const eyewear = [
  { id: 1, name: "Glasses 1", folder: "glasses-01" },
  { id: 2, name: "Glasses 2", folder: "glasses-02" },
  { id: 3, name: "Glasses 3", folder: "glasses-03" },
  { id: 4, name: "Glasses 4", folder: "glasses-04" },
  { id: 5, name: "Glasses 5", folder: "glasses-05" },
  { id: 6, name: "Glasses 6", folder: "glasses-06" },
  { id: 7, name: "Glasses 7", folder: "glasses-07" },
];

router.get("/glasses", (req, res) => {
  const glassesList = eyewear.map((item) => ({
    id: item.id,
    name: item.name,
    image: `${baseUrl}/3dmodel/${item.folder}/glasses_0${item.id}.png`, // Dynamic image path
    data: {
      type: "gltf",
      modelPath: `${baseUrl}/3dmodel/${item.folder}/scene.gltf`,
      model: "scene.gltf",
      textures: `${baseUrl}/3dmodel/${item.folder}/textures/texture.png`,
      x: 0,
      y: 0.3,
      z: 0,
      scale: 0.4,
      up: 0,
    },
  }));

  res.json(glassesList);
});

module.exports = router;
