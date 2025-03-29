const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createDeepAREffectFromImage(imagePath, outputPath) {
  try {
    const zip = new JSZip();
    const imageData = fs.readFileSync(imagePath);
    const imageExt = path.extname(imagePath).substring(1);

    const effectConfig = {
      schemaVersion: 1,
      title: path.basename(imagePath, path.extname(imagePath)),
      type: "2D",
      thumbnail: "thumbnail.png",
      preview: "preview.png",
      render: {
        assets: [
          {
            type: "image",
            id: "mainImage",
            uri: `image.${imageExt}`,
            usage: "render"
          }
        ],
        renderers: [
          {
            type: "image",
            assetId: "mainImage",
            position: [0, 0],
            scale: [1, 1],
            rotation: 0,
            alignment: "center",
            tracking: {
              type: "body",
              anchor: "upper-body"
            }
          }
        ]
      }
    };

    zip.file("effect.json", JSON.stringify(effectConfig, null, 2));
    zip.file(`image.${imageExt}`, imageData);
    zip.file("thumbnail.png", imageData);
    zip.file("preview.png", imageData);

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, content);
  } catch (error) {
    console.error('Error creating DeepAR effect:', error);
  }
}

module.exports = { createDeepAREffectFromImage };
