import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '../styles/TryOnPage.css';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import "@google/model-viewer";
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { throttle } from 'lodash';

const VirtualTryOnPage = () => {
  const [isPanelOpen, setPanelOpen] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [models, setModels] = useState([]);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [landmarks, setLandmarks] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const selectedOutfitRef = useRef(null);
  const webcamStreamRef = useRef(null);

  let lastVideoTime = -1;

  // Initialize PoseLandmarker
  const createPoseLandmarker = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        num_poses: 1,
        min_pose_detection_confidence: 0.75,
        min_pose_presence_confidence: 0.75,
        min_tracking_confidence: 0.75,
      });
      setPoseLandmarker(poseLandmarkerInstance);
      console.log("Pose Landmarker loaded successfully.");
    } catch (error) {
      console.error('Error creating PoseLandmarker:', error);
    }
  }, []);

  // Start webcam and predictions
  const enableCam = useCallback(async () => {
    if (!poseLandmarker) {
      alert('Wait! poseLandmarker not loaded yet. Try after sometime.');
      return;
    }

    if (webcamRunning) {
      setWebcamRunning(false);
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
    } else {
      setWebcamRunning(true);
    }

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true }); // Request webcam access
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        webcamStreamRef.current = videoStream; // Store the webcam stream

        let playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {}).catch(error => {
            console.error('Error starting video:', error);
          });
        }

        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    } catch (error) {
      alert('Error accessing webcam:', error);
    }
  }, [poseLandmarker, webcamRunning]);

  // Continuously detect landmarks in the video stream
  const predictWebcam = useCallback(() => {
    const video = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d', { willReadFrequently: true });
    const drawingUtils = new DrawingUtils(canvasCtx);

    if (canvasCtx && poseLandmarker) {
      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

          setLandmarks(result.landmarks);
          for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
          }
          canvasCtx.restore();
          throttledUpdateModelPosition();
        });
      }

      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
  }, [poseLandmarker, webcamRunning, lastVideoTime]);

  // Throttle the updateModelPosition function
  const throttledUpdateModelPosition = useCallback(throttle(() => {
    if (!selectedOutfitRef.current || landmarks.length === 0) return;

    const nose = getWorldPosition(0); // Nose (center of the body)
    const leftShoulder = getWorldPosition(11);
    const rightShoulder = getWorldPosition(12);
    const leftHip = getWorldPosition(23);
    const rightHip = getWorldPosition(24);

    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

    // Calculate center of shoulders (chest region)
    const shoulderCenter = new THREE.Vector3().lerpVectors(leftShoulder, rightShoulder, 0.5);

    // Adjust model position
    selectedOutfitRef.current.position.copy(shoulderCenter);
    selectedOutfitRef.current.position.y -= 50; // Move down slightly to fit torso

    // Adjust rotation based on shoulder alignment
    const shoulderDirection = new THREE.Vector3().subVectors(rightShoulder, leftShoulder);
    const angle = Math.atan2(shoulderDirection.y, shoulderDirection.x);
    selectedOutfitRef.current.rotation.y = -angle;

    // Calculate body center (midpoint between shoulders and hips)
    const bodyCenterX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
    const bodyCenterY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;

    // Scale the outfit based on shoulder width
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    selectedOutfitRef.current.scale.set(shoulderWidth * 3, shoulderWidth * 3, shoulderWidth * 3);

    // Position the outfit
    selectedOutfitRef.current.position.set(bodyCenterX * 3 - 1, -bodyCenterY * 3, 0);

    // Optionally, rotate the outfit to match the user's orientation
    const bodyAngle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
    selectedOutfitRef.current.rotation.z = bodyAngle;
  }, 100), [landmarks]);

  useEffect(() => {
    fetch('http://localhost:8080/models')
      .then((response) => response.json())
      .then((data) => {
        setModels(data); // Store the list of models in state
      })
      .catch((error) => {
        console.error('Error fetching models:', error);
      });

    createPoseLandmarker(); // Initialize PoseLandmarker
    initializeThreeJS();
  }, [createPoseLandmarker]);

  const getWorldPosition = useCallback((landmarkIndex) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Extract landmark position (Normalized between 0-1)
    const { x, y, z } = landmarks[landmarkIndex];

    // Convert normalized coordinates to Three.js world space
    const screenX = (x - 0.5) * window.innerWidth;
    const screenY = (0.5 - y) * window.innerHeight;
    const screenZ = z * 100; // Scale depth for visibility

    return new THREE.Vector3(screenX, screenY, screenZ);
  }, [landmarks]);

  // Update handleModelSelection to store the loaded outfit model in a ref
  const handleModelSelection = useCallback((model) => {
    setSelectedOutfit(model.name);
    const loader = new GLTFLoader();
    loader.load(model.url,
      function (glb) {
        const outfit = glb.scene;
        const keyPoints = {};

        // Traverse the model to find key points
        outfit.traverse((child) => {
          if (child.isMesh) {
            // Example heuristic: Find the highest point for the head
            if (!keyPoints.head || child.position.y > keyPoints.head.position.y) {
              keyPoints.head = child;
            }
            // Example heuristic: Find the lowest point for the feet
            if (!keyPoints.feet || child.position.y < keyPoints.feet.position.y) {
              keyPoints.feet = child;
            }
            // Example heuristic: Find the widest points for shoulders
            if (!keyPoints.leftShoulder || child.position.x < keyPoints.leftShoulder.position.x) {
              keyPoints.leftShoulder = child;
            }
            if (!keyPoints.rightShoulder || child.position.x > keyPoints.rightShoulder.position.x) {
              keyPoints.rightShoulder = child;
            }
          }
        });

        console.log("Keypoints: ", keyPoints);
        // Store the outfit and key points in the ref
        selectedOutfitRef.current = { outfit, keyPoints };

        outfit.scale.set(1, 1, 1);
        sceneRef.current.add(outfit);

      }, undefined, function (error) {
        console.error(error);
      }
    );
  }, []);

  const initializeThreeJS = useCallback(() => {
    if (!WebGL.isWebGL2Available()) {
      alert("WebGL is not supported by your browser.", WebGL.getWebGL2ErrorMessage());
    }

    const canvas = threeCanvasRef.current;
    if (!canvas) return;

    // Set full screen dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({ canvas }); // Attach to existing canvas
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Attach references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Add lights to the scene
    const light = new THREE.AmbientLight(0xffffff, 2); // Soft white light
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Handle resizing dynamically
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });

    // Animate loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Render Three.js scene
      renderer.render(scene, camera);

      throttledUpdateModelPosition();
    };

    animate();
  }, [throttledUpdateModelPosition]);

  const modelList = useMemo(() => (
    models.map((model, index) => (
      <li key={index} className="model-item" onClick={() => handleModelSelection(model)}>
        <model-viewer src={model.url} alt={model.name} auto-rotate camera-controls style={{ width: "200px", height: "200px" }} ></model-viewer>
        <p>{model.name}</p>
      </li>
    ))
  ), [models, handleModelSelection]);

  return (
    <div className="virtual-try-on">
      <section className="ar-container">
        <div>
          <button id="webcamButton" onClick={enableCam}>
            {webcamRunning ? 'Disable Predictions' : 'Enable Predictions'}
          </button>
        </div>

        <div className="video-canvas-container">
          <video id="webcam" autoPlay playsInline ref={videoRef} ></video>
          <canvas className="output_canvas" id="output_canvas" ref={canvasRef} width="1280" height="720" style={{ border: "1px solid black" }} ></canvas>
          <canvas id="three_canvas" ref={threeCanvasRef} width="1280" height="720" style={{ border: "1px solid black" }} ></canvas>
        </div>
      </section>

      <div className={`side-panel ${isPanelOpen ? "open" : "closed"}`}>
        {isPanelOpen && (
          <div className="outfit-selection">
            <h2>Select an Outfit</h2>
            <div className="outfit-grid">
              <div className="outfit-card">
                <h2>Select a Model</h2>
                {selectedOutfit && <p>You selected: {selectedOutfit}</p>}
                <ul className="model-list">{modelList}</ul>
              </div>
            </div>

            <div className="upload-container">
              <input type="file" id="upload-avatar" aria-label="Upload your avatar image" />
              <label htmlFor="upload-avatar" className="upload-button">
                Upload Outfit
              </label>
            </div>
          </div>
        )}
      </div>

      <button
        className="toggle-panel"
        onClick={() => setPanelOpen(!isPanelOpen)}
      >
        {isPanelOpen ? 'Close Panel' : 'Open Panel'}
      </button>
    </div>
  );
};

export default VirtualTryOnPage;