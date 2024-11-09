import React, { useEffect, useRef } from 'react';
import '../styles/TryOnPage.css';

const VirtualTryOnPage = () => {
  const videoRef = useRef(null);
  const arContainerRef = useRef(null);

  useEffect(() => {
    // Start webcam for video feed
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    // Clean up on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Adding A-Frame scripts dynamically
  useEffect(() => {
    const scriptAFrame = document.createElement('script');
    scriptAFrame.src = 'https://aframe.io/releases/1.2.0/aframe.min.js';
    scriptAFrame.async = true;

    const scriptARjs = document.createElement('script');
    scriptARjs.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/aframe/build/aframe-ar.min.js';
    scriptARjs.async = true;

    document.head.appendChild(scriptAFrame);
    document.head.appendChild(scriptARjs);

    return () => {
      document.head.removeChild(scriptAFrame);
      document.head.removeChild(scriptARjs);
    };
  }, []);

  return (
    <div className="virtual-try-on">
      <header className="page-header">
        <h1>Virtual Try-On</h1>
        <p>Experience your outfits in augmented reality!</p>
      </header>

      <section className="avatar-camera">
        <h2>Upload Image or Use AR</h2>
        <div className="ar-container" ref={arContainerRef}>
          {/* A-Frame scene */}
          <a-scene embedded arjs>
            <a-marker preset="hiro">
              <a-box position="0 0.5 0" rotation="0 45 45" color="blue" depth="0.5" height="0.5" width="0.5">
                <a-animation attribute="rotation" to="0 360 0" dur="3000" repeat="indefinite"></a-animation>
              </a-box>
            </a-marker>
            <a-entity camera></a-entity>
          </a-scene>
        </div>
        <div className="upload-container">
          <input type="file" id="upload-avatar" aria-label="Upload your avatar image" />
          <label htmlFor="upload-avatar" className="upload-button">Upload Image</label>
        </div>
      </section>

      <section className="outfit-selection">
        <h2>Select an Outfit</h2>
        <div className="outfit-grid">
          <div className="outfit-card">
            <img src="https://cdnb.artstation.com/p/marketplace/presentation_assets/001/059/593/large/file.jpg?1626537093" alt="Outfit 1" />
            <button>Select</button>
          </div>
          <div className="outfit-card">
            <img src="https://th.bing.com/th/id/OIP.xR_1gQX3zAXIoAhFgf8A0gHaLH?w=720&h=1080&rs=1&pid=ImgDetMain/300" alt="Outfit 2" />
            <button>Select</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VirtualTryOnPage;
