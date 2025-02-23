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
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true }); // Request webcam and audio access
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
        alert(`Error accessing webcam: ${error.message}. Please ensure your browser has permission to access the webcam and try again.`);
      }
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
        });
      }

      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
  }, [poseLandmarker, webcamRunning, lastVideoTime]);

  

  useEffect(() => {
    fetch('http://localhost:8080/models')
      .then((response) => response.json())
      .then((data) => {
        // Separate models.json from other models
        const modelsJson = data.find((model) => model.name === "models.json");
        const otherModels = data.filter((model) => model.name !== "models.json");

        // Fetch and store models.json in localStorage
        if (modelsJson) {
          fetch(modelsJson.url)
            .then((res) => res.json())
            .then((jsonData) => localStorage.setItem("modelInfo", JSON.stringify(jsonData)))
            .catch((err) => console.error("Error fetching models.json:", err));
        }

        // Store remaining models in state
        setModels(otherModels);
      })
      .catch((error) => {
        console.error('Error fetching models:', error);
      });

    createPoseLandmarker(); // Initialize PoseLandmarker
    initializeThreeJS();
  }, [createPoseLandmarker]);

  const initializeThreeJS = useCallback(() => {
    if (!WebGL.isWebGL2Available()) {
      alert("WebGL is not supported by your browser.");
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

    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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