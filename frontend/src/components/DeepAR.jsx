import { useEffect, useRef, useState } from 'react';
import '../styles/DeepARTryOn.css';
import * as DeepAR from 'deepar';

const DeepARTryOn = () => {
  const canvasRef = useRef(null);
  const deepARRef = useRef(null);
  const initializedRef = useRef(false); // Track initialization state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeDeepAR = async () => {
      // Skip if already initialized or initializing
      if (initializedRef.current || deepARRef.current) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        initializedRef.current = true; // Mark as initializing

        console.log('Initializing DeepAR...');
        
        deepARRef.current = await DeepAR.initialize({
          licenseKey: '46e03ebdd90a79c6ec898bef832509d632992d149df117794bfb94f5047a5777337f1f17bf15bca7',
          canvas: canvasRef.current,
          deeparWasmPath: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/wasm/deepar.wasm',
          segmentationConfig: {
            modelPath: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/models/segmentation/segmentation-160x160-opt.bin'
          },
          faceTrackingConfig: {
            modelPath: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/models/face/models-ffd-lite/face-tracker-model.bin'
          },
          effect: 'https://cdn.jsdelivr.net/npm/deepar@5.4.0/effects/aviators'
        });

        console.log('DeepAR initialized, starting camera...');
        await deepARRef.current.startCamera();

        deepARRef.current.callbacks.onFaceVisibilityChanged = (visible) => {
          console.log(visible ? "Face visible!" : "Face not visible!");
        };

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('DeepAR initialization error:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
          initializedRef.current = false; // Reset on error
        }
      }
    };

    initializeDeepAR();

    return () => {
      isMounted = false;
      
      // Only cleanup if we successfully initialized
      if (deepARRef.current) {
        console.log('Cleaning up DeepAR...');
        deepARRef.current.dispose()
          .then(() => {
            console.log('DeepAR disposed successfully');
            deepARRef.current = null;
            initializedRef.current = false;
          })
          .catch(e => {
            console.warn('DeepAR cleanup error:', e);
            deepARRef.current = null;
            initializedRef.current = false;
          });
      }
    };
  }, []); // Empty dependency array means this runs once on mount

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
          <p>Please check camera permissions and try refreshing.</p>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        id="deepar-canvas"
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
};

export default DeepARTryOn;