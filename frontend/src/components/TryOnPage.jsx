import React, { useState, useEffect, useRef } from 'react';
import '../styles/TryOnPage.css';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; 

const VirtualTryOnPage = () => {
  const [isPanelOpen, setPanelOpen] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [models, setModels] = useState([]);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [poseLandmarker, setPoseLandmarker] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const [landmarks, setLandmarks] = useState([]);
  let lastVideoTime = -1;

  // Track the webcam stream
  const webcamStreamRef = useRef(null);

  // Initialize a Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);  // Add renderer to the DOM

  const loader = new GLTFLoader();
  let model;

  // Initialize PoseLandmarker
  const createPoseLandmarker = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
      });
      setPoseLandmarker(poseLandmarkerInstance);
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

    setWebcamRunning((prevState) => !prevState);

    const constraints = { video: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        webcamStreamRef.current = stream; // Store the webcam stream
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
    const canvasCtx = canvasElement.getContext('2d');

    if (canvasCtx && poseLandmarker) {
      const startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

          const drawingUtils = new DrawingUtils(canvasCtx);
          drawingUtilsRef.current = drawingUtils;

          result.landmarks.forEach((landmark) => {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
          });
          canvasCtx.restore();
        });
      }

      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
  };

  // Stop webcam when navigating away or stopping
  useEffect(() => {
    // Cleanup webcam on component unmount or when camera is stopped
    return () => {
      if (webcamStreamRef.current) {
        const tracks = webcamStreamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
    };
  }, []);

  // Access webcam for AR
  useEffect(() => {
    const video = document.getElementById('webcam');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        videoRef.current = video; // Store video reference
        var playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.then(_ => { })
            .catch(error => {
              console.error('Error starting video:', error);
            });
        }
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch models from backend
    fetch('http://localhost:8080/models')
      .then((response) => response.json())
      .then((data) => {
        setModels(data); // Store the list of models in state
      })
      .catch((error) => {
        console.error('Error fetching models:', error);
      });

    createPoseLandmarker(); // Initialize PoseLandmarker

    // Cleanup PoseLandmarker on component unmount
    return () => {
      if (poseLandmarker) {
        poseLandmarker.close();
      }
    };
  }, []);

  const handleModelSelection = (model) => {
    setSelectedOutfit(model.name);  // Use the name of the model instead of the whole object
    const modelUrl = `${model.url}`; // Construct the URL for the selected model

    // Load the model and handle 3D visualization or AR integration
    console.log(`Model selected: ${model.name}`);
    console.log('Model URL:', modelUrl);

    // Example logic to fetch and display the model
    fetch(modelUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load the model.");
        }
        return response.blob(); // Download the model as a binary blob
      })
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob); // Create an object URL for the model
        console.log('Model loaded successfully:', objectURL);

        // Load the GLTF model using Three.js
        loader.load(objectURL, (gltf) => {
          model = gltf.scene;
          scene.add(model);
          model.scale.set(0.5, 0.5, 0.5);  // Adjust scale as needed
          animate(); // Start the animation loop
        });
      })
      .catch((error) => {
        console.error('Error loading model:', error);
      });
  };

  const animate = () => {
    requestAnimationFrame(animate);

    // Rotate the model
    if (model) {
      model.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  };

  return (
    <div className="virtual-try-on">
      <section className="ar-container">
        <div>
          <button id="webcamButton" onClick={enableCam}>
            {webcamRunning ? 'Disable Predictions' : 'Enable Predictions'}
          </button>
        </div>

        <div className="video-canvas-container">
          <video
            id="webcam"
            autoPlay
            playsInline
            ref={videoRef}
          ></video>
          <canvas
            className="output_canvas"
            id="output_canvas"
            ref={canvasRef}
            width="1280"
            height="720"
            style={{ border: "1px solid black" }}
          ></canvas>

          {selectedOutfit && landmarks.length > 0 && (
            <img
              src={selectedOutfit}
              alt="Outfit"
              style={{
                position: 'absolute',
                top: `${landmarks[0].y * 100}%`,
                left: `${landmarks[0].x * 100}%`,
                width: '150px',
                height: '200px',
                objectFit: 'cover',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
      </section>

      <div className={`side-panel ${isPanelOpen ? 'open' : 'closed'}`}>
        {isPanelOpen && (
          <div className="outfit-selection">
            <h2>Select an Outfit</h2>
            <div className="outfit-grid">
              <div className="outfit-card">
                <h2>Select a Model</h2>
                {models.length === 0 ? (
                  <p>No models available.</p>
                ) : (
                  <ul>
                    {models.map((model, index) => (
                      <li key={index}>
                        <button onClick={() => handleModelSelection(model)}>
                          {model.name} {/* Render model's name */}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedOutfit && <p>You selected: {selectedOutfit}</p>}
              </div>
            </div>

            <div className="upload-container">
              <input
                type="file"
                id="upload-avatar"
                aria-label="Upload your avatar image"
              />
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
