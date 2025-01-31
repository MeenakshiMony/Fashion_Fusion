import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../styles/TryOnPage.css';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import "@google/model-viewer";
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

const VirtualTryOnPage = () => {
  const [isPanelOpen, setPanelOpen] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [models, setModels] = useState([]);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [poseLandmarker, setPoseLandmarker] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const [landmarks, setLandmarks] = useState([]);
  let lastVideoTime = -1;

  // Track the webcam stream
  const webcamStreamRef = useRef(null);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
 
  


  // Initialize PoseLandmarker
  const createPoseLandmarker = async () => {
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
        num_poses:1,
        min_pose_detection_confidence:0.75,
        min_pose_presence_confidence:0.75,
        min_tracking_confidence:0.75,
      });
      setPoseLandmarker(poseLandmarkerInstance);
      console.log("Pose Landmarker loaded successfully.");
    } catch (error) {
      console.error('Error creating PoseLandmarker:', error);
    }
  };

  // Start webcam and predictions
  const enableCam = async () => {
    if (!poseLandmarker) {
      alert('Wait! poseLandmarker not loaded yet. Try after sometime.');
      return;
    }

    if (webcamRunning === true) {
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
  };

  // Continuously detect landmarks in the video stream
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d',{willReadFrequently: true});
    const drawingUtils = new DrawingUtils(canvasCtx);

    if (canvasCtx && poseLandmarker) {
      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

          setLandmarks(result.landmarks);
          for(const landmark of result.landmarks){
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
  };


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
  }, []);

  const handleModelSelection = (model) => {
    setSelectedOutfit(model.name);
    const loader = new GLTFLoader();
    loader.load(model.url, 
      function (glb){
        scene.add(glb);
      },undefined, function(error) {
        console.error(error);
      }
    )

    // Example logic to fetch and display the model
    fetch(model.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load the model.");
        }
        return response.blob(); // Download the model as a binary blob
      })
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob); // Create an object URL for the model
        console.log('Model loaded successfully:', objectURL);
      });
  };

 

  const initializeThreeJS = () => {
    if (!WebGL.isWebGL2Available()) {
      alert("WebGL is not supported by your browser.", WebGL.getWebGL2ErrorMessage());
    }
    
    const canvas = threeCanvasRef.current;
    if (!canvas) return;
  
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ canvas }); // Attach to existing canvas
    renderer.setSize(canvas.width, canvas.height);
    
  
    // Add a rotating cube (for testing)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  
    camera.position.z = 5;
  
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
  
    animate();

  };
  
  
  const modelList = useMemo(() => (
    models.map((model, index) => (
      <li key={index} className="model-item" onClick={() => handleModelSelection(model)}>
        <model-viewer src={model.url} alt={model.name} auto-rotate camera-controls style={{ width: "200px", height: "200px" }} ></model-viewer>
        <p>{model.name}</p>
      </li>
    ))
  ))

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
              {selectedOutfit && <p>You selected:{selectedOutfit.name}</p>}
              <ul className="model-list">{modelList}</ul>
            </div>
          </div>

          <div className="upload-container">
            <input type="file" id="upload-avatar" aria-label="Upload your avatar image"/>
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