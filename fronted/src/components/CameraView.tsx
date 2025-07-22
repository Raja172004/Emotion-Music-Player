import React, { useEffect } from 'react';
import { Video, VideoOff } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  error: string | null;
  onToggle: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  videoRef, 
  isActive, 
  error, 
  onToggle 
}) => {
  // Ensure the camera stream is re-attached if the videoRef changes (e.g., after a layout/resolution change)
  useEffect(() => {
    if (isActive && videoRef.current && videoRef.current.srcObject == null) {
      // Try to find an existing stream from other video elements
      const streams = Array.from(document.querySelectorAll('video'))
        .map(v => v.srcObject)
        .filter(Boolean);
      if (streams.length > 0) {
        videoRef.current.srcObject = streams[0];
      }
    }
  }, [isActive, videoRef]);

  return (
    <div className="bg-white p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-400 font-medium">Camera Feed</h3>
        <button
          onClick={onToggle}
          className={`p-2 rounded bg-gray-100 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors ${
            isActive ? 'text-pink-500 hover:bg-pink-100' : ''
          }`}
        >
          {isActive ? <VideoOff size={16} /> : <Video size={16} />}
        </button>
      </div>
      
      <div className="relative bg-gray-50 rounded overflow-hidden aspect-video">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-pink-500 text-sm text-center p-4">
            {error}
          </div>
        ) : isActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-blue-400">
            <VideoOff size={48} />
          </div>
        )}
      </div>
    </div>
  );
};