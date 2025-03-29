import { useEffect, useRef, useState } from 'react';
import '../styles/DeepARTryOn.css';
import * as DeepAR from 'deepar';

const DeepARTryOn = () => {
  const canvasRef = useRef(null);
  const deepARRef = useRef(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deeparFile, setDeepARFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    let isMounted = true;

    const initializeDeepAR = async () => {
      if (initializedRef.current || deepARRef.current) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        initializedRef.current = true;

        // Check if canvas is available
        if (!canvasRef.current) {
          throw new Error('Canvas element not available');
        }

        // Initialize with only necessary features
        deepARRef.current = await DeepAR.initialize({
          licenseKey: 'your-license-key',
          canvas: canvasRef.current,
          deeparWasmPath: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/wasm/deepar.wasm',
          faceTrackingConfig: {
            modelPath: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/models/face/models-ffd-lite/face-tracker-model.bin'
          },
          effect: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/effects/aviators' //ray-ban-wayfarer.deepar
        });

        // Handle camera permissions more gracefully
        try {
          await deepARRef.current.startCamera();
        } catch (cameraError) {
          throw new Error('Camera access denied or not available');
        }

        deepARRef.current.callbacks.onFaceVisibilityChanged = (visible) => {
          console.log(visible ? "Face visible!" : "Face not visible!");
        };

        setLoading(false);
      } catch (err) {
        console.error('DeepAR error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize AR experience');
          setLoading(false);
          initializedRef.current = false;
        }
      }
    };

    initializeDeepAR();

    return () => {
      isMounted = false;
      
      if (deepARRef.current) {
        deepARRef.current.dispose()
          .then(() => {
            deepARRef.current = null;
            initializedRef.current = false;
          })
          .catch(e => {
            console.warn('Cleanup error:', e);
          });
      }
    };
  }, []); // Empty array is correct for mount-only effect

  

  return (
    <div className="deepar-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading AR experience...</p>
        </div>
      )}

      {error && (
        <div className="error-overlay">
          <h3>Error Loading AR</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        id="deepar-canvas"
        style={{ 
          display: loading || error ? 'none' : 'block',

        }}
      />
     
    </div>
  );
};

export default DeepARTryOn;