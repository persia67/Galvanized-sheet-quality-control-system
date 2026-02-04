import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Square, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  isAnalyzing: boolean;
  autoMode: boolean;
  setAutoMode: (mode: boolean) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isAnalyzing, autoMode, setAutoMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Auto capture loop
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (autoMode && !isAnalyzing) {
      intervalId = setInterval(() => {
        captureFrame();
      }, 5000); // Capture every 5 seconds for demo
    }
    return () => clearInterval(intervalId);
  }, [autoMode, isAnalyzing]);

  const startCamera = async () => {
    const attempts = [
      // 1. Ideal Industrial setup: Rear camera (environment), Full HD
      { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } },
      // 2. Relaxed: Just environment facing
      { video: { facingMode: 'environment' } },
      // 3. Fallback: Any camera available (e.g., laptop webcam)
      { video: true }
    ];

    for (const constraints of attempts) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError('');
        return; // Success, exit function
      } catch (err) {
        console.warn('Camera attempt failed with constraints:', constraints, err);
        // Continue to next attempt
      }
    }

    // If we get here, all attempts failed
    setError('دوربین یافت نشد. لطفاً اتصال دوربین یا مجوزهای مرورگر را بررسی کنید.');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg relative border border-slate-700">
      {error ? (
        <div className="h-64 sm:h-96 flex items-center justify-center text-red-400 gap-2 flex-col p-4 text-center">
          <AlertCircle size={48} className="mb-2 opacity-80" />
          <span className="font-bold text-lg">خطا در دسترسی به دوربین</span>
          <span className="text-sm opacity-80">{error}</span>
          <button 
            onClick={() => startCamera()}
            className="mt-4 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-white text-sm"
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        <div className="relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-64 sm:h-96 object-cover bg-black"
          />
          <div className="absolute top-4 right-4 bg-red-600/80 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            ZND-LINE-CAM-01
          </div>
          
          {/* Overlay Grid for industrial look */}
          <div className="absolute inset-0 border-2 border-slate-500/30 pointer-events-none">
             <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/50"></div>
             <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-500/50"></div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">وضعیت</span>
          <span className={`text-sm font-bold ${autoMode ? 'text-green-400' : 'text-yellow-400'}`}>
            {autoMode ? 'بازرسی خودکار فعال' : 'آماده به کار'}
          </span>
        </div>
        
        <div className="flex gap-3">
          {!autoMode && (
            <button 
              onClick={captureFrame} 
              disabled={isAnalyzing || !!error}
              className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="تک شات"
            >
              <Camera size={24} />
            </button>
          )}
          
          <button 
            onClick={() => setAutoMode(!autoMode)}
            disabled={!!error}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              autoMode 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-brand-600 hover:bg-brand-500 text-white'
            }`}
          >
            {autoMode ? (
              <>
                <Square size={18} fill="currentColor" /> توقف
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> شروع بازرسی خودکار
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraView;