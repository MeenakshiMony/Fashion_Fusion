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
import ModelSidePanel from '../components/ModelSidePanel';
import { SkeletonHelper } from 'three';
import * as Kalidokit from "kalidokit";
import * as tf from '@tensorflow/tfjs';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';


const Model = ({ data, landmarks, worldLandmarks, width, height }) => {
    const { scene } = useGLTF(data.url);
    const groupRef = useRef();
    const [scalingRatios, setScalingRatios] = useState({
        width: null,
        height: null,
      });
      const previousRatios = useRef({ width: null, height: null });
      groupRef.current.position.set(0, 0, 0);

    const currentQuaternion = useRef(new THREE.Quaternion());
    const bodyForward = useRef(new THREE.Vector3());
  
    useEffect(() => {
      if (scene) {
        console.log("Loaded GLTF Scene:", scene); //consoling 3D model properties
        scene.traverse((obj) => {
          if (obj.isBone) {                       //checking whether bone is present and console it if present
            console.log("Bone Name:", obj.name); 
          }
        });
      }
    }, [scene]);

    //Listing body landmarks detected by mediapipe pose landmarker task
    const boneMapping = {
        nose: 0,
        left_eye_inner: 1,
        left_eye: 2,
        left_eye_outer: 3,
        right_eye_inner: 4,
        right_eye: 5,
        right_eye_outer: 6,
        left_ear: 7,
        right_ear: 8,
        left_mouth: 9,
        right_mouth: 10,
        left_shoulder: 11,
        right_shoulder: 12,
        left_elbow: 13,
        right_elbow: 14,
        left_wrist: 15,
        right_wrist: 16,
        left_pinky: 17,
        right_pinky: 18,
        left_index: 19,
        right_index: 20,
        left_thumb: 21,
        right_thumb: 22,
        left_hip: 23,
        right_hip: 24,
        left_knee: 25,
        right_knee: 26,
        left_ankle: 27,
        right_ankle: 28,
        left_heel: 29,
        right_heel: 30,
        left_foot_index: 31,
        right_foot_index: 32,
    };
  
    // Function to update outfit bones based on landmarks
    useFrame(() => {
      if (!groupRef.current || !landmarks ) {
        console.warn("⚠️ Scene or landmarks missing!");
        return;
      }

    const model_shoulder_width = 27.857;
    const model_hipwidth = 15.224;
    const model_torso_length = 10.08;

    // Function to calculate Euclidean distance (2D only)
    const calculateDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    
    // Function to find the midpoint between two landmarks
    const findMidpoint = (x1, y1, x2, y2) => {
        return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        };
    };

    // 1. Extract landmarks and convert directly to pixel coordinates
    const leftShoulder = {
        x: landmarks[11].x * width,
        y: landmarks[11].y * height,
    };
    const rightShoulder = {
        x: landmarks[12].x * width,
        y: landmarks[12].y * height,
    };
    const leftHip = {
        x: landmarks[23].x * width,
        y: landmarks[23].y * height,
    };
    const rightHip = {
        x: landmarks[24].x * width,
        y: landmarks[24].y * height,
    };

    const user_shoulderWidth = calculateDistance(
        leftShoulder.x,
        leftShoulder.y,
        rightShoulder.x,
        rightShoulder.y
      );

      const user_hipWidth = calculateDistance(
        leftHip.x,
        leftHip.y,
        rightHip.x,
        rightHip.y
      );

    // Find midpoints of shoulders and hips
    const user_shoulderMidpoint = findMidpoint(
        leftShoulder.x,
        leftShoulder.y,
        rightShoulder.x,
        rightShoulder.y
      );

      const user_hipMidpoint = findMidpoint(
        leftHip.x,
        leftHip.y,
        rightHip.x,
        rightHip.y
      );

      // Calculate torso length (distance between shoulder midpoint and hip midpoint)
      const user_torsolength = calculateDistance(
        user_shoulderMidpoint.x,
        user_shoulderMidpoint.y,
        user_hipMidpoint.x,
        user_hipMidpoint.y
      );

      // Compute torso midpoint (average of shoulder and hip midpoints)
    const user_torsoMidpoint = findMidpoint(
        user_shoulderMidpoint.x,
        user_shoulderMidpoint.y,
        user_hipMidpoint.x,
        user_hipMidpoint.y
    );
    // Position the model based on the torso midpoint
    groupRef.current.position.set(user_torsoMidpoint.x, user_torsoMidpoint.y, 0);

      // Compute scaling ratios
      const widthScalingRatio = user_shoulderWidth / model_shoulder_width; 
      const heightScalingRatio = user_torsolength / model_torso_length;  

      // Update state with calculated ratios
      setScalingRatios({
        width: widthScalingRatio,
        height: heightScalingRatio,
      });

      if (
        previousRatios.current.width !== widthScalingRatio ||
        previousRatios.current.height !== heightScalingRatio
      ) {
        groupRef.current.scale.set(widthScalingRatio , heightScalingRatio , 1);
        previousRatios.current = { width: widthScalingRatio, height: heightScalingRatio };
      }

      console.log(
        `Model positioned at torso midpoint (${user_torsoMidpoint.x}, ${user_torsoMidpoint.y}).`,
        `Width Scaling Ratio: ${widthScalingRatio}, Height Scaling Ratio: ${heightScalingRatio}`
      );
      

    });

    return (
        <group ref={groupRef}>  // ✅ Ref here
          <primitive object={scene} />  // Original model untouched
          <arrowHelper args={[bodyForward.current, new THREE.Vector3(0, 0, 0), 0.5, 0xff0000]} />
        </group>
      );
};

    //   Object.keys(boneMapping).forEach((boneName) => {
    //     const landmarkIndex = boneMapping[boneName];
    //     const bone = scene.getObjectByName(boneName);
    //     const landmark = landmarks[0][landmarkIndex];
  
    //     if (!bone) {
    //       console.warn(`🚨 Bone not found for: ${boneName}`);
    //       return;
    //     }
    //     if (!landmark) {
    //       console.warn(`🚨 Landmark not found for index: ${landmarkIndex}`);
    //       return;
    //     }
  
    //     const leftShoulder = landmarks[0][11];
    //     const rightShoulder = landmarks[0][12];
  
    //     // Compute angle for proper facing direction
    //     const faceAngle = Math.atan2(
    //       rightShoulder.y - leftShoulder.y,
    //       rightShoulder.x - leftShoulder.x
    //     );
  
    //     if (groupRef.current) {
    //         groupRef.current.rotation.y = faceAngle;
  
    //       const newPos = {
    //         x: (landmark.x - 0.5) * 2, // Convert to -1 to 1 range for Three.js
    //         y: (0.5 - landmark.y) * 2, // Flip Y axis
    //         z: landmark.z * 0.1,
    //       };
  
    //       groupRef.current.position.set(newPos.x, newPos.y, newPos.z);
    //       groupRef.current.scale.set(5, 5, 5);
    //     }
    //   });
    // });
  


// const GlassModel = ({data, landmarks}) => {
//     // Load 3d model
//     const gltf = useGLTF(data.url);
//     const modelRef = useRef();

//     useFrame(() => {    
//         if( !landmarks || landmarks.length === 0) return;

//         const leftEyeOuter = landmarks[0][3]
//         const rightEyeOuter = landmarks[0][6]

//         // Compute eye center position
//         const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
//         const eyeCenterY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
//         const eyeCenterZ = (leftEyeOuter.z + rightEyeOuter.z) / 2;

//         // Compute eye distance (scaling factor)
//         const eyeWidth = Math.sqrt(
//             Math.pow(rightEyeOuter.x - leftEyeOuter.x, 2) +
//             Math.pow(rightEyeOuter.y - leftEyeOuter.y, 2) +
//             Math.pow(rightEyeOuter.z - leftEyeOuter.z, 2)
//         );

//         // Fix the scaling factor by dividing by a base reference size
//         const baseEyeDistance = 60; // Adjust based on typical face size in pixels
//         const scaleFactor = (eyeWidth / baseEyeDistance) * data.scale;

//         // Compute rotation (yaw angle)
//         const angle = Math.atan2(
//             rightEyeOuter.y - leftEyeOuter.y,
//             rightEyeOuter.x - leftEyeOuter.x
//         );

//         // Apply transformations to the 3D model
//         if (modelRef.current) {
        
//             modelRef.current.position.set(eyeCenterX, eyeCenterY, eyeCenterZ);
//             modelRef.current.scale.set(data.scale, data.scale, data.scale);
//             modelRef.current.rotation.set(Math.PI, angle, -angle);
//         }
//         console.log("Model Position:", modelRef.current.position);
//         console.log("Model Scale:", modelRef.current.scale);
        
//     });

//     return <primitive ref={modelRef} object={gltf} />;

// };
Model.propTypes = {
    data: PropTypes.shape({
        url: PropTypes.string.isRequired
    }).isRequired,
    landmarks: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
                z: PropTypes.number.isRequired
            })
        )
    ),
    worldLandmarks: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
                z: PropTypes.number.isRequired
            })
        )
    ),
    width: PropTypes.number,  // Corrected integer type
    height: PropTypes.number 
};
const TryOnPage = () => {

    const [poseLandmarker, setPoseLandmarker] = useState(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [selectedGlasses, setSelectedGlasses] = useState(null);
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [isPanelOpen, setPanelOpen] = useState(false);
    const [landmarks, setLandmarks] = useState(null);
    const [riggedPose, setRiggedPose] = useState(null);
    const [riggedFace, setRiggedFace] = useState(null);
    const [riggedLeftHand, setRiggedLeftHand] = useState(null);
    const [riggedRightHand, setRiggedRightHand] = useState(null);
    const [width, setwidth] = useState(null);
    const [height,setheight] = useState(null);
    const [worldLandmarks, setWorldLandmarks] = useState(null);

    const webcamRef = useRef(null); 
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    
    useEffect(() => {
        const initializePoseLandmarker = async () => {
            try {

                // TensorFlow.js backend setup
                await tf.setBackend('webgl'); // Or 'wasm'
                await tfjsWasm.setWasmPaths(
                    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
                );
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
                modelComplexity: 1,       // Balanced accuracy/speed
                smoothLandmarks: true,    // Reduce jitter
                enableSegmentation: false,// No background removal
                smoothSegmentation: false,// N/A (segmentation off)
                minDetectionConfidence: 0.5, // Moderate detection strictness
                minTrackingConfidence: 0.5,  // Moderate tracking strictness
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

        let lastVideoTime = -1;

        const detectPose = async () => {
        if (webcamRef.current.video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(detectPose);
            return;
        }
        
        if(webcamRef.current.video.currentTime !== lastVideoTime) {
            const results = await poseLandmarker.detectForVideo(webcamRef.current.video, performance.now());
            if (results.landmarks) {
                drawLandmarks(results.landmarks);
                setLandmarks(results.landmarks[0]);  
                setWorldLandmarks(results.worldLandmarks[0]);
                
                
            }
            lastVideoTime = webcamRef.current.video.currentTime;
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
        setheight(canvas.height);
        setwidth(canvas.width);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw landmarks
        landmarks.forEach(landmark => {
            landmark.forEach(point => {
                if(point.visibility < 0.5) return;
                // Use normalized coordinates directly
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

    const handleModelSelect = (model) => {
        setSelectedOutfit(model);
        console.log(model);
    };

    return(
        <div>
            <h1>Try On Page</h1>
            <div className="try-on-container" style={{position: 'relative'}}>
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={true} 
                    className="webcam"
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user' }}
                    style={{ transform: "scaleX(-1)",display: cameraOn ? 'block' : 'none'}}
                    onUserMedia={() => {
                    console.log("Webcam ready");
                    
                    }}                  
                />
                <canvas ref={canvasRef} className="pose-canvas" style={{ display: cameraOn ? 'block' : 'none' }} />
                <Canvas
                    className="threejs-canvas"
                    style={{
                        width: "100vw", // Full viewport width
                        height: "100vh", // Full viewport height
                        display: "block", // Prevent scrollbars
                    }}
                    camera={{ position: [0, 2, 10], fov: 75 }} // Adjust camera as needed
                    >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10,10,10]} intensity={0.8} />
                    <OrbitControls />
                    <Suspense fallback={null}>
                        {selectedOutfit && (
                                <Model
                                    data={selectedOutfit}
                                    landmarks={landmarks}
                                    worldLandmarks={worldLandmarks}
                                    width={width}
                                    height={height}
                                />
                            )}
                    </Suspense>
                </Canvas>
            </div>
            <button onClick={() => setCameraOn(!cameraOn)}>
                {cameraOn ? 'Stop Camera' : 'Start Camera'}
            </button>

            <div className={`side-panel ${isPanelOpen ? "open" : "closed"}`}>
                {isPanelOpen && <ModelSidePanel onModelSelect={handleModelSelect} />}
                {selectedOutfit && <p>Selected: {selectedOutfit.name}</p>} 
                {/* {isPanelOpen && <GlassesList onSelectGlasses={handleGlassesSelect} />}  */}
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