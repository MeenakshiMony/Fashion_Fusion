import React, { useState, useEffect, useRef, Suspense} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useGLTF, OrbitControls } from "@react-three/drei";
import Webcam from "react-webcam";
import { PoseLandmarker, FilesetResolver} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import PropTypes from "prop-types";
import GlassesList from "./GlassesList";
import '../styles/TryOnPage.css';


const Model = ({data, landmarks}) => {
    // Load 3d model
    const gltf = useGLTF(data.modelPath);
    const modelRef = useRef();

    useFrame(() => {    
        if( !landmarks || landmarks.length === 0) return;

        // Extract landmark points
        const leftEyeOuter = landmarks[0][3];
        const rightEyeOuter = landmarks[0][6];
        const nose = landmarks[0][0];

        // Compute eye center position
        const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
        const eyeCenterY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
        const eyeCenterZ = (leftEyeOuter.z + rightEyeOuter.z) / 2;

        // Compute eye distance (scaling factor)
        const eyeWidth = Math.sqrt(
            Math.pow(rightEyeOuter.x - leftEyeOuter.x, 2) +
            Math.pow(rightEyeOuter.y - leftEyeOuter.y, 2) +
            Math.pow(rightEyeOuter.z - leftEyeOuter.z, 2)
        );

        // Compute rotation (yaw angle)
        const angle = Math.atan2(
            rightEyeOuter.y - leftEyeOuter.y,
            rightEyeOuter.x - leftEyeOuter.x
        );

        // Apply transformations to the 3D model
        if (modelRef.current) {
            // Position the model
            modelRef.current.position.set(
                eyeCenterX + data.x, // Adjust x position
                eyeCenterY + data.y, // Adjust y position
                eyeCenterZ + data.z // Adjust z position
            );

            // Scale the model
            const scaleFactor = eyeWidth * data.scale * 5;
            modelRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Rotate the model
            modelRef.current.rotation.set(0, angle, 0);

            // Adjust the "up" position (vertical alignment)
            modelRef.current.position.y += data.up;
        }
        
    });

    return <primitive ref={modelRef} object={gltf.scene} />;

};

    // Add PropTypes validation
    Model.propTypes = {
        data: PropTypes.shape({
            modelPath: PropTypes.string.isRequired,
            x: PropTypes.number,
            y: PropTypes.number,
            z: PropTypes.number,
            scale: PropTypes.number,
            up: PropTypes.number,
        }).isRequired,
        landmarks: PropTypes.arrayOf(
            PropTypes.arrayOf(
                PropTypes.shape({
                    x: PropTypes.number.isRequired,
                    y: PropTypes.number.isRequired,
                    z: PropTypes.number.isRequired,
                })
            )
        ).isRequired,
    };

const TryOnPage = () => {

    const [poseLandmarker, setPoseLandmarker] = useState(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [selectedGlasses, setSelectedGlasses] = useState(null);
    const [isPanelOpen, setPanelOpen] = useState(false);
    const [landmarks, setLandmarks] = useState(null);

    const webcamRef = useRef(null); 
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    
    useEffect(() => {
        const initializePoseLandmarker = async () => {
            try {
              const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
              );
              const poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
                  delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numPoses: 1,
              });
              setPoseLandmarker(poseLandmarkerInstance);
            } catch (err) {
                console.error('Failed to initialize pose detection:', err);
                alert('Pose detection failed. Please try again.');
            }
          };

          initializePoseLandmarker();

          // Cleanup on unmount
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
    }, []);

    useEffect(() => {
        if(cameraOn && poseLandmarker) {
            startPoseDetection();
        } else{
            stopPoseDetection();    
        }
    }, [cameraOn, poseLandmarker]);

    // Start pose detection
    const startPoseDetection = () => {
        if (!webcamRef.current || !poseLandmarker) return;

        const detectPose = async () => {
        if (webcamRef.current.video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(detectPose);
            return;
        }
        
        const results = await poseLandmarker.detectForVideo(webcamRef.current.video, performance.now());
        if (results.landmarks) {
            drawLandmarks(results.landmarks);
            setLandmarks(results.landmarks);   
            
        }

        animationFrameRef.current = requestAnimationFrame(detectPose);
        };

        detectPose();
    };

    // Stop pose detection
    const stopPoseDetection = () => {
        if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        }
    };

    // Draw landmarks on canvas
    const drawLandmarks = (landmarks) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = webcamRef.current.video;

        // Set canvas dimensions to match video feed
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw landmarks
        landmarks.forEach(landmark => {
            landmark.forEach(point => {
                if(point.visibility < 0.5) return;
                const x = point.x * canvas.width;
                const y = point.y * canvas.height; 

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            });
        });
    };

    const handleGlassesSelect = (glasses) => {
        setSelectedGlasses(glasses);
        console.log("Selected Glasses:", glasses); 
    };


    return(
        <div>
            <h1>Try On Page</h1>
            <div style={{position: 'relative'}}>
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user' }}
                    style={{ display: cameraOn ? 'block' : 'none', position: 'relative' }}
                    onUserMedia={() => {
                    console.log("Webcam ready");
                    
                    }}                  
                />
                <canvas ref={canvasRef} style={{ display: cameraOn ? 'block' : 'none', position: 'absolute', top: 0, left: 0  }} />
                <Canvas style={{position:'absolute', top: 0, left: 0, display: cameraOn ? 'block' : 'none'}} >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10,10,10]} intensity={0.8} />
                    <OrbitControls />
                    <Suspense fallback={null}>
                        {selectedGlasses && ( <Model data={selectedGlasses.data} landmarks={landmarks} /> )}   
                    </Suspense>
                    </Canvas>
            </div>
            <button onClick={() => setCameraOn(!cameraOn)}>
                {cameraOn ? 'Stop Camera' : 'Start Camera'}
            </button>

            <div className={`side-panel ${isPanelOpen ? "open" : "closed"}`}>
                {isPanelOpen && <GlassesList onSelectGlasses={handleGlassesSelect} />}
                {selectedGlasses && (
                <div className="selected-glasses-preview">
                    <h3>Selected: {selectedGlasses.name}</h3>
                    <img src={selectedGlasses.image} alt={selectedGlasses.name} />
                </div>
                )}
            </div>

            <button
                className="toggle-panel"
                onClick={() => setPanelOpen(!isPanelOpen)}>
                    {isPanelOpen ? 'Close Panel' : 'Open Panel'}
            </button>

        </div>  
    )
};

export default TryOnPage;   