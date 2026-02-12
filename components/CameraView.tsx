import React, { useRef, useEffect, useState } from 'react';
import { Icons } from './Icons';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  isAnalyzing: boolean;
  autoMode: boolean;
  setAutoMode: (mode: boolean) => void;
}

const styles = {
  container: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    position: 'relative' as 'relative',
    border: '1px solid #334155'
  },
  videoContainer: {
    position: 'relative' as 'relative',
    height: '400px',
    backgroundColor: 'black'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as 'cover'
  },
  overlay: {
    position: 'absolute' as 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(2, 132, 199, 0.9)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backdropFilter: 'blur(4px)'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4ade80',
    borderRadius: '50%'
  },
  grid: {
    position: 'absolute' as 'absolute',
    inset: 0,
    pointerEvents: 'none' as 'none',
    opacity: 0.5
  },
  controls: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    color: 'white'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  captureBtn: {
    backgroundColor: '#334155',
    color: 'white',
    padding: '12px',
    borderRadius: '9999px',
    border: '1px solid #475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  autoBtn: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: active ? '#ef4444' : '#0284c7',
    color: 'white'
  }),
  errorBox: {
    height: '400px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: '#f87171',
    textAlign: 'center' as 'center',
    padding: '16px'
  }
};

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isAnalyzing, autoMode, setAutoMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeRes, setActiveRes] = useState<string>('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (autoMode && !isAnalyzing) {
      intervalId = setInterval(() => captureFrame(), 5000);
    }
    return () => clearInterval(intervalId);
  }, [autoMode, isAnalyzing]);

  const startCamera = async () => {
    // Priority 1: Dahua HFW2440 (approx 4MP: 2688x1520)
    // Priority 2: Dahua HFW1230 (approx 2MP: 1920x1080)
    // Priority 3: Fallback generic HD
    const attempts = [
      { 
        label: '4MP (Dahua 2440)',
        video: { width: { ideal: 2688 }, height: { ideal: 1520 }, facingMode: 'environment' } 
      },
      { 
        label: '2MP (Dahua 1230)',
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment' } 
      },
      { 
        label: 'Generic Webcam',
        video: true 
      }
    ];

    for (const constraints of attempts) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints.video as MediaStreamConstraints);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Wait for metadata to get actual resolution
          videoRef.current.onloadedmetadata = () => {
             if(videoRef.current) {
                setActiveRes(`${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
             }
          };
        }
        setError('');
        console.log(`Camera connected using profile: ${constraints.label}`);
        return; 
      } catch (err) {
        console.warn(`Camera attempt failed for ${constraints.label}:`, err);
      }
    }
    setError('دوربین داهوآ یا وبکم شناسایی نشد. لطفاً اتصال USB یا درایور Virtual Camera را بررسی کنید.');
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
        onCapture(canvas.toDataURL('image/jpeg', 0.9));
      }
    }
  };

  return (
    <div style={styles.container}>
      {error ? (
        <div style={styles.errorBox}>
          <div style={{ marginBottom: '16px' }}><Icons.AlertTriangle size={48} /></div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', display: 'block' }}>خطا در دسترسی به دوربین</span>
          <span style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>{error}</span>
          <button 
            onClick={() => startCamera()}
            style={{ marginTop: '24px', padding: '8px 24px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        <div style={styles.videoContainer}>
            <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div style={styles.overlay}>
            <div style={styles.liveDot}></div>
            DAHUA LIVE {activeRes ? `- ${activeRes}` : ''}
          </div>
          
          <div style={styles.grid}>
             {/* Simple CSS Grid Overlay for Center Focus */}
             <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', backgroundColor: 'rgba(6,182,212,0.3)' }}></div>
             <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', backgroundColor: 'rgba(6,182,212,0.3)' }}></div>
          </div>
        </div>
      )}
      
      <div style={styles.controls}>
        <div>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>وضعیت سامانه</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: autoMode ? '#4ade80' : '#e2e8f0' }}>
            {error ? 'قطع ارتباط' : autoMode ? 'درحال بازرسی پیوسته' : 'آماده عکس‌برداری'}
          </span>
        </div>
        
        <div style={styles.buttonGroup}>
          {!autoMode && !error && (
            <button 
              onClick={captureFrame} 
              disabled={isAnalyzing}
              style={{ ...styles.captureBtn, opacity: isAnalyzing ? 0.5 : 1 }}
              title="تک شات دقیق"
            >
              <Icons.Camera size={24} />
            </button>
          )}
          
          <button 
            onClick={() => setAutoMode(!autoMode)}
            disabled={!!error}
            style={{ ...styles.autoBtn(autoMode), opacity: error ? 0.5 : 1 }}
          >
            {autoMode ? (
              <>
                <Icons.Square size={18} /> توقف بازرسی
              </>
            ) : (
              <>
                <Icons.Play size={18} /> شروع بازرسی خودکار
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraView;