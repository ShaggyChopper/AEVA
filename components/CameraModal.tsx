import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon, CheckIcon, ArrowPathIcon } from './icons';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stable function to stop the camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  // Stable function to start the camera stream
  const startCamera = useCallback(async () => {
    try {
      // Ensure any previous stream is stopped before starting a new one
      if (streamRef.current) {
        stopCamera();
      }
      setCapturedImage(null);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer rear camera
        audio: false,
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsStreaming(true);

    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
      setIsStreaming(false);
    }
  }, [stopCamera]);

  // Effect to manage camera lifecycle on mount and unmount
  useEffect(() => {
    startCamera();

    // The returned function is the cleanup function, called on unmount
    return stopCamera;
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        stopCamera(); // Stop the stream after capture
      }
    }
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleUsePhoto = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        if (blob) {
          onCapture(blob);
        }
        onClose();
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-4 transform transition-all animate-in fade-in-0 zoom-in-95 border border-slate-700 relative aspect-[9/16] md:aspect-video overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
            <p className="text-red-400">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 rounded-lg">Close</button>
          </div>
        )}
        
        {!error && capturedImage ? (
          <div className="w-full h-full">
            <img src={capturedImage} alt="Captured receipt" className="w-full h-full object-contain rounded-lg" />
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain rounded-lg"></video>
        )}

        <canvas ref={canvasRef} className="hidden"></canvas>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4">
          {capturedImage ? (
            <>
              <button onClick={handleRetake} className="p-4 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30 transition-colors" aria-label="Retake Photo">
                <ArrowPathIcon className="h-8 w-8" />
              </button>
              <button onClick={handleUsePhoto} className="p-4 bg-blue-500 text-white rounded-full backdrop-blur-md hover:bg-blue-600 transition-colors" aria-label="Use Photo">
                <CheckIcon className="h-8 w-8" />
              </button>
            </>
          ) : (
            <button onClick={handleCapture} disabled={!isStreaming} className="p-4 bg-white/20 border-4 border-white rounded-full backdrop-blur-md disabled:opacity-50" aria-label="Take Photo">
              <div className="w-10 h-10 bg-white rounded-full"></div>
            </button>
          )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-colors" aria-label="Close camera">
            <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default CameraModal;