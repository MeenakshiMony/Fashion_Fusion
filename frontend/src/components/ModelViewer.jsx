// src/components/ModelViewer.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const ModelViewer = ({ modelUrl }) => {
  return (
    <Canvas style={{ height: '400px', width: '100%' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Model url={modelUrl} />
      <OrbitControls />
    </Canvas>
  );
};

export default ModelViewer;
