import React, { useRef, useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const VirtualTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [shirtImg, setShirtImg] = useState(null);

  useEffect(() => {
    const setupCameraAndTensorFlow = async () => {
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
      console.log("Camera setup successful");
    };
  
    const loadShirt = async () => {
        const img = new Image();
        img.src = "/black_sweatshirt.png"; // Path to your shirt image
        img.onload = () => {
          setShirtImg(img);
          console.log("Shirt image loaded successfully:", img);
        };
        img.onerror = (error) => {
          console.error("Error loading shirt image:", error);
        };
      };
  
    setupCameraAndTensorFlow();
    loadShirt();
  }, []);
  
  useEffect(() => {
    if (!shirtImg) {
      console.warn("Shirt image not available yet");
      return;
    }
  
    const detectPose = async () => {
      try {
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        console.log("Pose detector initialized");
  
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = 640;
        canvas.height = 480;

        const videoWidth = canvas.width; 
  
        const detect = async () => {
          if (!videoRef.current) {
            console.warn("Video element not ready yet");
            return;
          }
  
          const poses = await detector.estimatePoses(videoRef.current);
          console.log("Poses detected:", poses);
  
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(videoRef.current, 0, 0, 640, 480);
  
          if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            // Mirror the x-coordinates
            const leftShoulder = keypoints[6];
            const rightShoulder = keypoints[5];
  
            console.log("Left shoulder keypoint:", leftShoulder);
            console.log("Right shoulder keypoint:", rightShoulder);
  
            if (leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
              const leftX = leftShoulder.x;
              const leftY = leftShoulder.y;
              const rightX = rightShoulder.x;
              const rightY = rightShoulder.y;
  
              const shoulderWidth = Math.sqrt(
                (rightX - leftX) ** 2 + (rightY - leftY) ** 2
              );
              console.log("Calculated shoulder width:", shoulderWidth);
  
              const desiredWidth = shoulderWidth / 0.6;
              const scaleFactor = desiredWidth / shirtImg.width;
  
              const newShirtWidth = Math.max(
                Math.round(shirtImg.width * scaleFactor),
                150
              );
              const newShirtHeight = Math.max(
                Math.round(shirtImg.height * scaleFactor),
                150
              );
  
              const xOffset = Math.max(
                0,
                Math.min(leftX - 0.2 * newShirtWidth, canvas.width - newShirtWidth)
              );
              const yOffset = Math.max(
                0,
                Math.min(leftY - 0.1 * newShirtHeight, canvas.height - newShirtHeight)
              );
  
              console.log("Drawing shirt at:", { xOffset, yOffset, newShirtWidth, newShirtHeight });
              ctx.drawImage(shirtImg, xOffset, yOffset, newShirtWidth, newShirtHeight);
            } else {
              console.warn("Shoulder keypoints not detected with high confidence");
            }
          } else {
            console.warn("No poses detected");
          }
  
          requestAnimationFrame(detect);
        };
        detect();
      } catch (error) {
        console.error("Error during pose detection:", error);
      }
    };
  
    detectPose();
  }, [shirtImg]);

  return (
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  }}
>
  <div style={{ position: "relative", width: "640px", height: "480px" }}>
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        transform: "scaleX(-1)", // Flip horizontally
        
      }}
    />
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        border: "1px solid #ccc",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transform: "scaleX(-1)",
      }}
    />
  </div>
</div>

  );
};

export default VirtualTryOn;
