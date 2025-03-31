import React, { useRef, useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

const VirtualTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tryOnMode, setTryOnMode] = useState("upperbody");
  const [itemImg, setItemImg] = useState(null);
  const [outfitImages, setOutfitImages] = useState([]);

  useEffect(() => {
    const setupCamera = async () => {
      await tf.ready();
      if (!(await tf.setBackend("webgpu"))) {
        console.warn("WebGPU not supported, falling back to WebGL");
        await tf.setBackend("webgl");
      }

      const stream = await navigator.mediaDevices.getUserMedia(
        { video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      console.log("Camera setup successful");
    };
    setupCamera();
  }, []);

  // Fetch images based on tryOnMode
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`http://localhost:8080/outfits/${tryOnMode}`);
        if (!response.ok) {
          console.error(`Error fetching images for ${tryOnMode}`);
          setOutfitImages([]);
          return;
        }
        const data = await response.json();
        setOutfitImages(data); // Array of images
      } catch (error) {
        console.error("Error fetching outfit images:", error);
        setOutfitImages([]);
      }
    };
    fetchImages();
  }, [tryOnMode]);

  // Update selected item image
  const handleImageClick = (image) => {
    const img = new Image();
    img.src = image.url;
    img.onload = () => setItemImg(img);
    img.onerror = (error) => console.error("Error loading image:", error);
  };

  useEffect(() => {
    if (!itemImg) return;

    const detectPose = async () => {
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });
      console.log("Pose detector initialized");
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = 640;
      canvas.height = 480;

      const detect = async () => {
        if (!videoRef.current) return;
        const poses = await detector.estimatePoses(videoRef.current);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);

        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          let anchorPoint1, anchorPoint2;

          if (tryOnMode === "eyewear") {
            const left = keypoints[2]; //left eye
            const right = keypoints[1]; //right eye
          } else if (tryOnMode === "upperBody") {
            left = keypoints[6]; //left shoulder
            right = keypoints[5]; //right shoulder
          } else if (tryOnMode === "lowerbody") {
            const leftHip = keypoints[11];  // Example index for left hip
            const rightHip = keypoints[12]; // Example index for right hip
            const leftKnee = keypoints[13]; // Example index for left knee
            const rightKnee = keypoints[14]; // Example index for right knee
          }

          // Ensure `anchorPoint1` and `anchorPoint2` are valid before accessing their properties
          if (anchorPoint1 && anchorPoint2 && anchorPoint1.score > 0.5 && anchorPoint2.score > 0.5) {
            let width, height, xOffset, yOffset;

            // Logic for eyewear
            if (tryOnMode === "eyewear") {
              const eyeWidth = Math.sqrt( (right.x - left.x) ** 2 + (right.y - left.y) ** 2);
              const desiredWidth = eyeWidth * 1.2;
              const scaleFactor = desiredWidth / itemImg.width;
              const newItemWidth = Math.max(Math.round(itemImg.width * scaleFactor), 50);
              const newItemHeight = Math.max(Math.round(itemImg.height * scaleFactor), 50);
              const XOffset = Math.max( 0, Math.min(left.x + (right.x - left.x) * 0.5 - newItemWidth / 2, canvas.width - newItemWidth));
              const YOffset = Math.max(0, Math.min(left.y - newItemHeight / 2, canvas.height - newItemHeight));
              console.log("Drawing eyewear at:", { XOffset, YOffset, newItemWidth, newItemHeight });
            }
            // Logic for upper body (shirt)
            else if (tryOnMode === "upperBody") {
              const shoulderWidth = Math.sqrt(
                (right.x - left.x) ** 2 + (right.y - left.y) ** 2
              );
              console.log("Calculated shoulder width:", shoulderWidth);

              const desiredWidth = shoulderWidth / 0.6;
              const scaleFactor = desiredWidth / itemImg.width;
              const newItemWidth = Math.max( Math.round(itemImg.width * scaleFactor), 150 );
              const newItemHeight = Math.max( Math.round(itemImg.height * scaleFactor), 150 );
              const XOffset = Math.max( 0, Math.min(left.x - 0.2 * newItemWidth, canvas.height - newItemWidth)); 
              const YOffset = Math.max( 0, Math.min(left.y - 0.1 * newItemHeight, canvas.height - newItemWidth) );
              console.log("Drawing shirt at:", { XOffset, YOffset, newItemWidth, newItemHeight });

            }
            // Logic for lower body (pants)
            else if (tryOnMode === "lowerbody") {
              if (leftHip.score > 0.5 && rightHip.score > 0.5 && leftKnee.score > 0.5 && rightKnee.score > 0.5) {
                const leftX = leftHip.x, leftY = leftHip.y, rightX = rightHip.x, rightY = rightHip.y;
                const hipWidth = Math.sqrt((rightX - leftX) ** 2 + (rightY - leftY) ** 2);
                const kneeWidth = Math.sqrt((rightKnee.x - leftKnee.x) ** 2 + (rightKnee.y - leftKnee.y) ** 2);
                const desiredWidth = Math.max(hipWidth, kneeWidth) * 1.5;
                const scaleFactor = desiredWidth / lowerBodyImg.width;
                const newLowerBodyWidth = Math.max(Math.round(lowerBodyImg.width * scaleFactor), 100);
                const newLowerBodyHeight = Math.max(Math.round(lowerBodyImg.height * scaleFactor), 150);
                const XOffset = Math.max(0, Math.min(leftX + (rightX - leftX) * 0.5 - newLowerBodyWidth / 2, canvas.width - newLowerBodyWidth));
                const YOffset = Math.max(0, Math.min(leftY + 20, canvas.height - newLowerBodyHeight));
              }
              console.log("Drawing lower body at:", { XOffset, YOffset, newLowerBodyWidth, newLowerBodyHeight });
            }

            // Draw the image at the calculated position
            ctx.drawImage(itemImg, xOffset, yOffset, newItemWidth, newItemHeight);
          }
        }
        requestAnimationFrame(detect);
      };
      detect();
    };
    detectPose();
  }, [itemImg, tryOnMode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Side Panel */}
      <div style={{ width: "200px", overflowY: "auto", borderRight: "1px solid #ccc", padding: "10px" }}>
        <h3>Outfits ({tryOnMode})</h3>
        {outfitImages.length === 0 && <p>No outfits available.</p>}
        {outfitImages.map((image) => (
          <div key={image.name} style={{ marginBottom: "10px", cursor: "pointer" }}>
            <img
              src={image.url}
              alt={image.name}
              style={{ width: "100%", height: "auto" }}
              onClick={() => handleImageClick(image)}
            />
          </div>
        ))}
      </div>

      <select value={tryOnMode} onChange={(e) => setTryOnMode(e.target.value)}>
        <option value="eyewear">Eyewear</option>
        <option value="upperbody">Upper Body</option>
        <option value="lowerbody">Lower Body</option>
      </select>
      <div style={{ position: "relative", width: "640px", height: "480px" }}>
        <video ref={videoRef} autoPlay playsInline style={{ position: "absolute", width: "100%", height: "100%", transform: "scaleX(-1)" }} />
        <canvas ref={canvasRef} style={{ position: "absolute", width: "100%", height: "100%", transform: "scaleX(-1)" }} />
      </div>
    </div>
  );
};

export default VirtualTryOn;


// import React, { useRef, useEffect, useState } from "react";
// import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs";
// import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// const VirtualTryOn = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [shirtImg, setShirtImg] = useState(null);

//   useEffect(() => {
//     const setupCameraAndTensorFlow = async () => {
//       // Initialize TensorFlow.js
//       await tf.ready();
//       if (!(await tf.setBackend("webgpu"))) {
//         console.warn("WebGPU not supported, falling back to WebGL");
//         await tf.setBackend("webgl");
//       }
  
//       // Set up the camera
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 },
//       });
//       videoRef.current.srcObject = stream;
//       console.log("Camera setup successful");
//     };
  
//     const loadShirt = async () => {
//         const img = new Image();
//         img.src = "/black_sweatshirt.png"; // Path to your shirt image
//         img.onload = () => {
//           setShirtImg(img);
//           console.log("Shirt image loaded successfully:", img);
//         };
//         img.onerror = (error) => {
//           console.error("Error loading shirt image:", error);
//         };
//       };
  
//     setupCameraAndTensorFlow();
//     loadShirt();
//   }, []);
  
//   useEffect(() => {
//     if (!shirtImg) {
//       console.warn("Shirt image not available yet");
//       return;
//     }
  
//     const detectPose = async () => {
//       try {
//         const detector = await poseDetection.createDetector(
//           poseDetection.SupportedModels.MoveNet,
//           { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
//         );
//         console.log("Pose detector initialized");
  
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         canvas.width = 640;
//         canvas.height = 480;

//         const videoWidth = canvas.width; 
  
//         const detect = async () => {
//           if (!videoRef.current) {
//             console.warn("Video element not ready yet");
//             return;
//           }
  
//           const poses = await detector.estimatePoses(videoRef.current);
//           console.log("Poses detected:", poses);
  
//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           ctx.drawImage(videoRef.current, 0, 0, 640, 480);
  
//           if (poses.length > 0) {
//             const keypoints = poses[0].keypoints;
//             // Mirror the x-coordinates
//             const leftShoulder = keypoints[6];
//             const rightShoulder = keypoints[5];
  
//             console.log("Left shoulder keypoint:", leftShoulder);
//             console.log("Right shoulder keypoint:", rightShoulder);
  
//             if (leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
//               const leftX = leftShoulder.x;
//               const leftY = leftShoulder.y;
//               const rightX = rightShoulder.x;
//               const rightY = rightShoulder.y;
  
//               const shoulderWidth = Math.sqrt(
//                 (rightX - leftX) ** 2 + (rightY - leftY) ** 2
//               );
//               console.log("Calculated shoulder width:", shoulderWidth);
  
//               const desiredWidth = shoulderWidth / 0.6;
//               const scaleFactor = desiredWidth / shirtImg.width;
  
//               const newShirtWidth = Math.max(
//                 Math.round(shirtImg.width * scaleFactor),
//                 150
//               );
//               const newShirtHeight = Math.max(
//                 Math.round(shirtImg.height * scaleFactor),
//                 150
//               );
  
//               const xOffset = Math.max(
//                 0,
//                 Math.min(leftX - 0.2 * newShirtWidth, canvas.width - newShirtWidth)
//               );
//               const yOffset = Math.max(
//                 0,
//                 Math.min(leftY - 0.1 * newShirtHeight, canvas.height - newShirtHeight)
//               );
  
//               console.log("Drawing shirt at:", { xOffset, yOffset, newShirtWidth, newShirtHeight });
//               ctx.drawImage(shirtImg, xOffset, yOffset, newShirtWidth, newShirtHeight);
//             } else {
//               console.warn("Shoulder keypoints not detected with high confidence");
//             }
//           } else {
//             console.warn("No poses detected");
//           }
  
//           requestAnimationFrame(detect);
//         };
//         detect();
//       } catch (error) {
//         console.error("Error during pose detection:", error);
//       }
//     };
  
//     detectPose();
//   }, [shirtImg]);

//   return (
//     <div
//   style={{
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100vh",
//   }}
// >
//   <div style={{ position: "relative", width: "640px", height: "480px" }}>
//     <video
//       ref={videoRef}
//       autoPlay
//       playsInline
//       style={{
//         position: "absolute",
//         top: "0",
//         left: "0",
//         width: "100%",
//         height: "100%",
//         transform: "scaleX(-1)", // Flip horizontally
        
//       }}
//     />
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "absolute",
//         top: "0",
//         left: "0",
//         width: "100%",
//         height: "100%",
//         border: "1px solid #ccc",
//         boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
//         transform: "scaleX(-1)",
//       }}
//     />
//   </div>
// </div>

//   );
// };

// export default VirtualTryOn;
