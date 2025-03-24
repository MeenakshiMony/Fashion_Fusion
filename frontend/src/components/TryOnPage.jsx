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


// const Model = ({ data, riggedPose, riggedFace, riggedLeftHand, riggedRightHand }) => {
//     const { scene } = useGLTF(data.url);
//     const modelRef = useRef();

//     useEffect(() => {
//         if (scene) {
//             console.log("Loaded GLTF Scene:", scene);
//             scene.traverse((obj) => {
//                 if (obj.isBone) {
//                     console.log("Bone Name:", obj.name);
//                 }
//             });
//         }
//     }, [scene]);

//     useFrame(() => {
//         if (!modelRef.current || !riggedPose) return;

//         // Map rigged pose to the 3D model bones
//         const rigPoints = {
//             "nose": riggedPose.head,
//             "left_eye_(inner)": riggedPose.leftEye,
//             "left_eye": riggedPose.leftEye,
//             "left_eye_(outer)": riggedPose.leftEye,
//             "right_eye_(inner)": riggedPose.rightEye,
//             "right_eye": riggedPose.rightEye,
//             "right_eye_(outer)": riggedPose.rightEye,
//             "left_ear": riggedPose.leftEar,
//             "right_ear": riggedPose.rightEar,
//             "mouth_(left)": riggedPose.mouth,
//             "mouth_(right)": riggedPose.mouth,
//             "left_shoulder": riggedPose.leftShoulder,
//             "right_shoulder": riggedPose.rightShoulder,
//             "left_elbow": riggedPose.leftElbow,
//             "right_elbow": riggedPose.rightElbow,
//             "left_wrist": riggedPose.leftWrist,
//             "right_wrist": riggedPose.rightWrist,
//             "left_pinky": riggedPose.leftPinky,
//             "right_pinky": riggedPose.rightPinky,
//             "left_index": riggedPose.leftIndex,
//             "right_index": riggedPose.rightIndex,
//             "left_thumb": riggedPose.leftThumb,
//             "right_thumb": riggedPose.rightThumb,
//             "left_hip": riggedPose.leftHip,
//             "right_hip": riggedPose.rightHip,
//             "left_knee": riggedPose.leftKnee,
//             "right_knee": riggedPose.rightKnee,
//             "left_ankle": riggedPose.leftAnkle,
//             "right_ankle": riggedPose.rightAnkle,
//             "left_heel": riggedPose.leftHeel,
//             "right_heel": riggedPose.rightHeel,
//             "left_foot_index": riggedPose.leftFootIndex,
//             "right_foot_index": riggedPose.rightFootIndex,
//         };

//         // Apply rigged data to the 3D model bones
//         Object.keys(rigPoints).forEach((boneName) => {
//             const bone = modelRef.current.getObjectByName(boneName);
//             const rigData = rigPoints[boneName];

//             if (bone && rigData) {
//                 bone.rotation.set(rigData.rotation.x, rigData.rotation.y, rigData.rotation.z);
//                 bone.position.set(rigData.position.x, rigData.position.y, rigData.position.z);
//             }
//         });
//     });

//     return <primitive ref={modelRef} object={scene} />;
// };

const Model = ({data, landmarks, width,   height}) => {
    
    const {scene} = useGLTF(data.url);
    const modelRef = useRef();

    useEffect(() => {
        if (scene) {
            console.log("Loaded GLTF Scene:", scene);
            scene.traverse((obj) => {
                if (obj.isBone) {
                    console.log("Bone Name:", obj.name);
                }
            });
        }
    }, [scene]);

    // Function to update outfit bones based on landmarks
    const updateOutfitBones = (skeleton, poseLandmarks) => {
        if (!scene || !poseLandmarks || poseLandmarks.length === 0) {
            console.warn("⚠️ Scene or landmarks missing!");
            return;
        }

        const boneMapping = {
            "nose": 0, "left_eye_(inner)": 1,
            "left_eye": 2, "left_eye_(outer)": 3,
            "right_eye_(inner)": 4, "right_eye": 5,
            "right_eye_(outer)": 6, "left_ear": 7,
            "right_ear": 8, "left_mouth": 9,
            "right_mouth": 10, "left_shoulder": 11,
            "right_shoulder": 12, "left_elbow": 13,
            "right_elbow": 14, "left_wrist": 15,
            "right_wrist": 16, "left_pinky": 17,
            "right_pinky": 18, "left_index": 19,
            "right_index": 20, "left_thumb": 21,
            "right_thumb": 22, "left_hip": 23,
            "right_hip": 24, "left_knee": 25,
            "right_knee": 26, "left_ankle": 27,
            "right_ankle": 28, "left_heel": 29,
            "right_heel": 30, "left_foot_index": 31,
            "right_foot_index": 32
          }
          
        const landmarkScale = 500; 

        Object.keys(boneMapping).forEach((boneName) => {
        
            const landmarkIndex = boneMapping[boneName];
            const bone = skeleton.getObjectByName(boneName);
            const landmark = poseLandmarks[0][landmarkIndex];

            if (!bone) {
                console.warn(`🚨 Bone not found for: ${boneName}`);
                return;
            }
            if (!landmark) {
                console.warn(`🚨 Landmark not found for index: ${landmarkIndex}`);
                return;
            }
            
            const leftShoulder = landmarks[0][11];
            const rightShoulder = landmarks[0][12];
            const leftHip = landmarks[0][23];
            const rightHip = landmarks[0][24];
            

            // Compute shoulder width
            const shoulderWidth = Math.hypot(
                Math.pow(rightShoulder.x - leftShoulder.x, 2) +
                Math.pow(rightShoulder.y - leftShoulder.y, 2)
              )*landmarkScale ;

            // Base reference size (change this based on model size)
           

            // Compute scale factor
            const baseShoulderWidth = 16; 
            const scaleFactor = shoulderWidth / baseShoulderWidth;
            modelRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Compute angle for proper facing direction
            const faceAngle = Math.atan2(
                rightShoulder.x - leftShoulder.x, 
                rightShoulder.z - leftShoulder.z
            );
            modelRef.current.rotation.y = -faceAngle + Math.PI;

            // Normalize landmark values to match the 3D model scale
          
            const newPos = {
                x: (landmark.x - 0.5) * 2,  // Convert to -1 to 1 range for Three.js
                y: (0.5 - landmark.y) * 2,  // Flip Y axis
                z: landmark.z * 0.1   
            };

            modelRef.current.position.set(newPos.x, newPos.y, newPos.z);
        });
    };

    // Update bone positions each frame
    useFrame(() => {
        if (landmarks && scene) {
            updateOutfitBones(scene, landmarks);
        }
    });

    return <primitive ref={modelRef} object={scene} />;

};



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
                setLandmarks(results.landmarks);  
                
                
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
                    className="webcam"
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user' }}
                    style={{ display: cameraOn ? 'block' : 'none'}}
                    onUserMedia={() => {
                    console.log("Webcam ready");
                    
                    }}                  
                />
                <canvas ref={canvasRef} className="pose-canvas" style={{ display: cameraOn ? 'block' : 'none' }} />
                <Canvas className="threejs-canvas" style={{display: cameraOn ? 'block' : 'none'}} >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10,10,10]} intensity={0.8} />
                    <OrbitControls />
                    <Suspense fallback={null}>
                        {selectedOutfit && (
                                <Model
                                    data={selectedOutfit}
                                    landmarks={landmarks}
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