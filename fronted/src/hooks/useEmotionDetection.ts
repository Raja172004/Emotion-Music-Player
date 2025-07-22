import { useState, useEffect, useRef } from 'react';
import { EmotionType, EmotionData } from '../types';

const EMOTIONS: EmotionType[] = ['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'];

export const useEmotionDetection = (isActive: boolean) => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      setError('Camera access denied or not available');
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Simulate emotion detection
  const detectEmotion = () => {
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence
    
    setCurrentEmotion({
      emotion,
      confidence,
      timestamp: Date.now()
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      setIsDetecting(true);
      startCamera().then(success => {
        if (success) {
          // Start emotion detection every 5 seconds
          detectEmotion(); // Initial detection
          interval = setInterval(detectEmotion, 5000);
        } else {
          setIsDetecting(false);
        }
      });
    } else {
      setIsDetecting(false);
      stopCamera();
    }

    return () => {
      if (interval) clearInterval(interval);
      stopCamera();
    };
  }, [isActive]);

  return {
    currentEmotion,
    isDetecting,
    error,
    videoRef
  };
};