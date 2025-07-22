import { useState, useEffect, useRef, useCallback } from 'react';
import { EmotionType, EmotionData } from '../types';
import { useBackendIntegration } from './useBackendIntegration';

export const useRealEmotionDetection = (isActive: boolean) => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(Math.random().toString(36).substr(2, 9));

  const { detectEmotion, isConnected } = useBackendIntegration();

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
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

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 and remove the data URL prefix
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    // Remove "data:image/jpeg;base64," prefix to get just the base64 data
    return dataUrl.split(',')[1];
  }, []);

  const performEmotionDetection = useCallback(async () => {
    if (!isConnected) {
      // Fallback to simulation if backend is not connected
      const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = 0.7 + Math.random() * 0.3;
      
      const emotionData = {
        emotion,
        confidence,
        timestamp: Date.now()
      };
      
      console.log('🎭 Simulated emotion detected:', emotionData);
      setCurrentEmotion(emotionData);
      return;
    }

    const imageData = captureFrame();
    if (!imageData) return;

    try {
      console.log('🔍 Performing real emotion detection...');
      console.log('Image data length:', imageData?.length);
      console.log('Session ID:', sessionId.current);
      const result = await detectEmotion(imageData, sessionId.current);
      if (result) {
        console.log('🎭 Real emotion detected:', result);
        setCurrentEmotion(result);
      }
    } catch (err) {
      console.error('❌ Emotion detection failed:', err);
      setError('Emotion detection failed');
    }
  }, [isConnected, captureFrame, detectEmotion]);

  useEffect(() => {
    if (isActive) {
      setIsDetecting(true);
      startCamera().then(success => {
        if (success) {
          // Start emotion detection every 5 seconds
          performEmotionDetection(); // Initial detection
          intervalRef.current = setInterval(performEmotionDetection, 5000);
        } else {
          setIsDetecting(false);
        }
      });
    } else {
      setIsDetecting(false);
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, performEmotionDetection]);

  // Create canvas element for frame capture
  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }

    return () => {
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, []);

  return {
    currentEmotion,
    isDetecting,
    error,
    videoRef,
    isBackendConnected: isConnected,
    performEmotionDetection
  };
};