import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Square, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [isMockMode, setIsMockMode] = useState(false);
  
  // Animation ref for mock mode
  const animationRef = useRef<number>(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Mock Mode Animation (Simulates a moving steel sheet)
  useEffect(() => {
    if (isMockMode && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let offset = 0;
        
        const render = () => {
            canvas.width = 640;
            canvas.height = 360; // 16:9 aspect ratio

            // Draw Steel Background (Metallic Gradient)
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#bdc3c7');
            gradient.addColorStop(0.2, '#ffffff');
            gradient.addColorStop(0.5, '#bdc3c7');
            gradient.addColorStop(0.8, '#95a5a6');
            gradient.addColorStop(1, '#bdc3c7');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw "Conveyor" movement lines
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 2;
            offset = (offset + 5) % 100;
            
            for (let i = -100; i < canvas.width; i += 100) {
                ctx.beginPath();
                ctx.moveTo(i + offset, 0);
                ctx.lineTo(i + offset, canvas.height);
                ctx.stroke();
            }

            // Simulate some random defects/noise periodically for realism
            if (Math.random() > 0.98) {
                 ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                 const x = Math.random() * canvas.width;
                 const y = Math.random() * canvas.height;
                 const r = Math.random() * 10 + 2;
                 ctx.beginPath();
                 ctx.arc(x, y, r, 0, Math.PI * 2);
                 ctx.fill();
            }

            // Text overlay to indicate simulation
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('SIMULATION MODE (NO CAMERA DETECTED)', 20, 30);

            animationRef.current = requestAnimationFrame(render);
        };
        render();
    }
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMockMode]);

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
    setIsMockMode(false);
    const attempts = [
      { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode: 'environment' } },
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
        return; 
      } catch (err) {
        console.warn('Camera attempt failed:', constraints, err);
      }
    }

    // Fallback to Mock Mode if all attempts fail
    console.warn('All camera attempts failed. Switching to Simulation Mode.');
    setIsMockMode(true);
    setError('');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    // Capture from Simulation Canvas
    if (isMockMode && canvasRef.current) {
        const imageSrc = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(imageSrc);
        return;
    }

    // Capture from Real Video Feed
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
          {isMockMode ? (
             <canvas 
               ref={canvasRef} 
               className="w-full h-64 sm:h-96 object-cover bg-slate-200"
             />
          ) : (
             <>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-64 sm:h-96 object-cover bg-black"
                />
                {/* Hidden canvas for real camera capture */}
                <canvas ref={canvasRef} className="hidden" />
             </>
          )}

          <div className="absolute top-4 right-4 bg-red-600/80 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            {isMockMode ? 'SIMULATION MODE' : 'ZND-LINE-CAM-01'}
          </div>
          
          {/* Overlay Grid for industrial look */}
          <div className="absolute inset-0 border-2 border-slate-500/30 pointer-events-none">
             <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/50"></div>
             <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-500/50"></div>
          </div>
        </div>
      )}
      
      <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">وضعیت</span>
          <span className={`text-sm font-bold ${autoMode ? 'text-green-400' : 'text-yellow-400'}`}>
            {autoMode ? 'بازرسی خودکار فعال' : 'آماده به کار'}
          </span>
        </div>
        
        <div className="flex gap-3">
            {isMockMode && (
                <button 
                onClick={() => startCamera()} 
                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full transition-colors"
                title="تلاش مجدد اتصال دوربین"
                >
                <RefreshCw size={24} />
                </button>
            )}

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