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
  const [screenshot, setScreenshot] = useState(null);
  const [isRendering, setIsRendering] = useState(false);

  // API base URL
  const API_BASE_URL = "http://localhost:8080/outfits";

  // Function to take a screenshot
  const takeScreenshot = () => {
    if (!canvasRef.current) return;
    
    // Create a temporary canvas to draw both video and outfit
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvasRef.current, 0, 0);
    
    // Convert to data URL and set as screenshot
    const screenshotUrl = tempCanvas.toDataURL('image/png');
    setScreenshot(screenshotUrl);
  };

  // Function to download the screenshot
  const downloadScreenshot = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `virtual-tryon-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let detector = null;
    let animationFrameId = null;
    let active = true; // Flag to control async operations

    let lastFpsCheck = Date.now();
    let frameCount = 0;
  
    // Force clear canvas using multiple methods
    const hardClearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.width; // Reset canvas (triggers buffer clear)
    };
  
    // Debug function to check canvas state
    const debugCanvasState = () => {
      const imageData = ctx.getImageData(0, 0, 1, 1).data;
      // console.log('Canvas first pixel:', imageData);
    };
  
    const outfitImg = new Image();
    outfitImg.crossOrigin = "anonymous";
  
    const loadOutfit = async () => {
      try {
        hardClearCanvas();
        // console.log('Canvas cleared - loading new outfit');
  
        // Create fresh detector each time
        if (detector) await detector.dispose();
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
  
        // Set canvas dimensions matching video
        if (videoRef.current) {
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
        }
  
        // Force reset canvas buffer again
        canvas.width = canvas.width;
  
        const renderFrame = async () => {
          if (!active || !videoRef.current || !outfitImg.complete) {
            return;
          }
  
          try {
            const t0 = performance.now();
            const poses = await detector.estimatePoses(videoRef.current);
            const t1 = performance.now();
            console.log(`Pose detection latency: ${Math.round(t1 - t0)} ms`);

            
            // COMPLETELY clear canvas using multiple methods
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
  
            // Draw fresh video frame
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
            if (poses.length > 0) {
              const keypoints = poses[0].keypoints;
              const avgConfidence = keypoints.reduce((sum, kp) => sum + kp.score, 0) / keypoints.length;
              console.log(`Average confidence Score: ${avgConfidence.toFixed(2)}`);

              // Debug keypoints
              // console.log('Keypoints detected:', keypoints);
              
              // Draw outfit
              if (tryOnMode === "upperbody") {
                placeUpperBodyItem(ctx, keypoints, outfitImg);
              } else if (tryOnMode === "eyewear") {
                placeEyewearItem(ctx, keypoints, outfitImg);
              } else if (tryOnMode === "lowerbody") {
                placeLowerBodyItem(ctx, keypoints, outfitImg);
              }
            }
  
            debugCanvasState();

            // 🔍 FPS logic
            frameCount++;
            const now = Date.now();
            if (now - lastFpsCheck >= 1000) {
              console.log(`FPS: ${frameCount}`);
              frameCount = 0;
              lastFpsCheck = now;
            }
            
          } catch (err) {
            console.error('Render error:', err);
          }
  
          if (active) {
            animationFrameId = requestAnimationFrame(renderFrame);
          }
        };
  
        outfitImg.onload = () => {
          // console.log('Outfit image loaded');
          renderFrame();
        };
  
        outfitImg.onerror = (e) => {
          // console.error('Image load error:', e);
          hardClearCanvas();
        };
  
        // Trigger load AFTER setting handlers
        outfitImg.src = `${selectedOutfit.imageUrl}?${Date.now()}`; // Cache busting
  
      } catch (err) {
        console.error('Detection setup error:', err);
        hardClearCanvas();
      }
    };
  
    loadOutfit();
  
    return () => {
      // console.log('Cleaning up...');
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (detector) detector.dispose();
      hardClearCanvas();
      
      // Force garbage collection
      setTimeout(() => {
        canvas.width = canvas.width;
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }, 0);
    };
  }, [selectedOutfit, tryOnMode]);

  const placeUpperBodyItem = (ctx, keypoints, img) => {
    const leftShoulder = keypoints[6];
    const rightShoulder = keypoints[5];

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
      const yPos = leftY - newHeight * 0.2 + 20;

      ctx.drawImage(img, xPos, yPos, newWidth, newHeight);
    }
  };

  const placeEyewearItem = (ctx, keypoints, img) => {
    const leftEye = keypoints[1];
    const rightEye = keypoints[2];
    

    if (leftEye.score > 0.5 && rightEye.score > 0.5) {
      const eyeDistance = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
      );

      const scaleFactor = eyeDistance / (img.width * 0.4);
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      const midPointX = (leftEye.x + rightEye.x) / 2;
      const midPointY = (leftEye.y + rightEye.y) / 2;

      const xPos = midPointX - newWidth / 2;
      const yPos = midPointY - newHeight / 2;

      ctx.drawImage(img, xPos, yPos, newWidth, newHeight);
    }
  };

  const placeLowerBodyItem = (ctx, keypoints, img) => {
    const leftHip = keypoints[12];
    const rightHip = keypoints[11];

    if (leftHip.score > 0.5 && rightHip.score > 0.5) {
      const hipWidth = Math.sqrt(
        Math.pow(rightHip.x - leftHip.x, 2) + Math.pow(rightHip.y - leftHip.y, 2)
      );

      const scaleFactor = hipWidth / (img.width * 0.3);
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      // Center horizontally between hips
      const xPos = (leftHip.x + rightHip.x) / 2 - newWidth / 2;

      // Adjust the y-position to place the top of the outfit just below the hips
      const yPos = Math.min(leftHip.y, rightHip.y) - newHeight * 0.1;

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
          {isRendering && (
            <div className="rendering-overlay">
              Loading new outfit...
            </div>
          )}
          <button 
            className="screenshot-button"
            onClick={takeScreenshot}
          >
            <i className="camera-icon">📷</i> Capture
          </button>
        </div>

        {/* Screenshot preview */}
        {screenshot && (
          <div className="screenshot-preview">
            <h3>Screenshot Preview</h3>
            <img src={screenshot} alt="Screenshot" className="screenshot-image" />
            <div className="screenshot-actions">
              <button 
                onClick={() => downloadScreenshot(screenshot)}
                className="download-button"
              >
                <i className="download-icon">⬇</i> Download
              </button>
              <button 
                onClick={() => setScreenshot(null)}
                className="close-button"
              >
                <i className="close-icon">✕</i> Close
              </button>
            </div>
          </div>
        )}

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

