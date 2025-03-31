import React, { useRef, useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import '../styles/TryOnPage.css';

const VirtualTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tryOnMode, setTryOnMode] = useState("upperbody");
  const [outfitItems, setOutfitItems] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = "http://localhost:8080/outfits";

  // Fetch outfits from the API
  const fetchOutfits = async (mode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${mode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const formattedItems = data.map((item, index) => ({
        id: index + 1, // Generate IDs if backend doesn't provide them
        name: item.name.replace(/_/g, ' ').replace('.png', '').replace('.jpg', ''), // Clean up names
        imageUrl: item.url // Map 'url' to 'imageUrl'
      }));
      setOutfitItems(formattedItems);
      
      if (data.length > 0) {
        setSelectedOutfit(data[0]);
      } else {
        setError(`No ${mode} items available`);
      }
    } catch (err) {
      setError("Failed to load outfits. Please try again.");
      console.error("Error fetching outfits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits(tryOnMode);
  }, [tryOnMode]);

  useEffect(() => {
    const setupCameraAndTensorFlow = async () => {
      try {
        // Initialize TensorFlow.js
        await tf.ready();
        if (!(await tf.setBackend("webgpu"))) {
          console.warn("WebGPU not supported, falling back to WebGL");
          await tf.setBackend("webgl");
        }

        // Set up the camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error setting up camera or TensorFlow:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    setupCameraAndTensorFlow();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedOutfit) return;

    const outfitImg = new Image();
    outfitImg.crossOrigin = "anonymous"; // Handle CORS if needed
    outfitImg.src = selectedOutfit.imageUrl;
    outfitImg.onerror = () => {
      console.error("Failed to load outfit image");
      setError("Failed to load outfit image");
    };

    const detectPose = async () => {
      try {
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = 640;
        canvas.height = 480;

        const detect = async () => {
          if (!videoRef.current || !outfitImg.complete) return;

          const poses = await detector.estimatePoses(videoRef.current);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            
            if (tryOnMode === "upperbody") {
              placeUpperBodyItem(ctx, keypoints, outfitImg);
            } else if (tryOnMode === "eyewear") {
              placeEyewearItem(ctx, keypoints, outfitImg);
            } else if (tryOnMode === "lowerbody") {
              placeLowerBodyItem(ctx, keypoints, outfitImg);
            }
          }

          requestAnimationFrame(detect);
        };

        detect();
      } catch (err) {
        console.error("Error during pose detection:", err);
      }
    };

    detectPose();
  }, [selectedOutfit, tryOnMode]);

  const placeUpperBodyItem = (ctx, keypoints, img) => {
    const leftShoulder = keypoints[5]; // MoveNet keypoint indices
    const rightShoulder = keypoints[6];

    if (leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
      const leftX = leftShoulder.x;
      const leftY = leftShoulder.y;
      const rightX = rightShoulder.x;
      const rightY = rightShoulder.y;

      const shoulderWidth = Math.sqrt(
        Math.pow(rightX - leftX, 2) + Math.pow(rightY - leftY, 2)
      );

      const scaleFactor = shoulderWidth / (img.width * 0.6);
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      const xPos = leftX - newWidth * 0.2;
      const yPos = leftY - newHeight * 0.1;

      ctx.drawImage(img, xPos, yPos, newWidth, newHeight);
    }
  };

  const placeEyewearItem = (ctx, keypoints, img) => {
    const leftEye = keypoints[1];
    const rightEye = keypoints[2];
    const nose = keypoints[0];

    if (leftEye.score > 0.5 && rightEye.score > 0.5 && nose.score > 0.5) {
      const eyeDistance = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
      );

      const scaleFactor = eyeDistance / (img.width * 0.8);
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      const xPos = (leftEye.x + rightEye.x) / 2 - newWidth / 2;
      const yPos = nose.y - newHeight * 0.7;

      ctx.drawImage(img, xPos, yPos, newWidth, newHeight);
    }
  };

  const placeLowerBodyItem = (ctx, keypoints, img) => {
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];

    if (leftHip.score > 0.5 && rightHip.score > 0.5) {
      const hipWidth = Math.sqrt(
        Math.pow(rightHip.x - leftHip.x, 2) + Math.pow(rightHip.y - leftHip.y, 2)
      );

      const scaleFactor = hipWidth / (img.width * 0.8);
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      const xPos = leftHip.x - newWidth * 0.1;
      const yPos = leftHip.y - newHeight * 0.2;

      ctx.drawImage(img, xPos, yPos, newWidth, newHeight);
    }
  };

  return (
    <div className="virtual-tryon-container">
      <div className="mode-selector">
        <h2>Virtual Try-On</h2>
        <div className="mode-buttons">
          <button
            className={tryOnMode === "eyewear" ? "active" : ""}
            onClick={() => setTryOnMode("eyewear")}
          >
            Eyewear
          </button>
          <button
            className={tryOnMode === "upperbody" ? "active" : ""}
            onClick={() => setTryOnMode("upperbody")}
          >
            Upper Body
          </button>
          <button
            className={tryOnMode === "lowerbody" ? "active" : ""}
            onClick={() => setTryOnMode("lowerbody")}
          >
            Lower Body
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tryon-view">
        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          />
          <canvas
            ref={canvasRef}
            className="canvas-element"
          />
        </div>

        <div className="outfit-selector">
          <h3>Available {tryOnMode} Items</h3>
          {isLoading ? (
            <div className="loading">Loading outfits...</div>
          ) : (
            <div className="outfit-grid">
              {outfitItems.map((item) => (
                <div
                  key={item.id}
                  className={`outfit-item ${selectedOutfit?.id === item.id ? "selected" : ""}`}
                  onClick={() => setSelectedOutfit(item)}
                >
                  <img src={item.imageUrl} alt={item.name} />
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
