import React from 'react';
import { EmotionData, Song } from '../types';
import { getEmotionColor, getEmotionIcon } from '../utils/audioUtils';

interface EmotionDisplayProps {
  emotion: EmotionData | null;
  isDetecting: boolean;
  recommendedSongs?: Song[];
  currentSong?: Song | null;
  onRecommendSong?: (song: Song) => void;
}

export const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ 
  emotion, 
  isDetecting, 
  recommendedSongs = [],
  currentSong,
  onRecommendSong
}) => {
  if (!isDetecting) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="text-center">
          <div className="text-indigo-900 mb-2 text-xl font-bold tracking-wide">Emotion Detection</div>
          <div className="text-gray-400 font-semibold">Inactive</div>
          <div className="mt-4 text-xs text-gray-400">
            Click the camera button to start detection
          </div>
        </div>
      </div>
    );
  }

  if (!emotion) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="text-center">
          <div className="text-indigo-900 mb-2 text-xl font-bold tracking-wide">Detecting Emotion...</div>
          <div className="animate-pulse w-14 h-14 bg-indigo-200 rounded-full mx-auto mb-4"></div>
          <div className="text-base text-yellow-500 font-semibold mb-2">Analyzing your facial expression</div>
          <div className="text-xs text-gray-600">
            Make sure your face is clearly visible to the camera
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-indigo-700">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span>Capturing video frame</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-yellow-600">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Sending to AI analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-yellow-500">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Processing results</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const emotionColor = getEmotionColor(emotion.emotion);
  const emotionIcon = getEmotionIcon(emotion.emotion);
  const confidencePercentage = Math.round(emotion.confidence * 100);

  // Always show the recommendation section
  const hasRecommendations = recommendedSongs.length > 0 && recommendedSongs.some(song => !currentSong || song.id !== currentSong.id);
  const isCurrentSongRecommended = currentSong && recommendedSongs.some(song => song.id === currentSong.id);

  return (
    <div className="space-y-4">
      {/* Main emotion display */}
      <div 
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-500"
        style={{ borderColor: emotionColor + '60' }}
      >
        <div className="text-center">
          <div className="text-indigo-900 mb-4 text-xl font-bold tracking-wide">Current Emotion</div>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-6xl">{emotionIcon}</span>
            <div>
              <div 
                className="text-3xl font-bold capitalize mb-1"
                style={{ color: emotionColor }}
              >
                {emotion.emotion}
              </div>
              <div className="text-lg text-yellow-500 font-semibold">
                {confidencePercentage}% confidence
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${confidencePercentage}%`,
                backgroundColor: emotionColor
              }}
            ></div>
          </div>
          <div className="text-xs text-indigo-700 space-y-1">
            <div>Detected: {emotion.emotion.toUpperCase()}</div>
            <div>Confidence: {confidencePercentage}%</div>
            <div>Time: {new Date(emotion.timestamp).toLocaleTimeString()}</div>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-indigo-400">Live Detection Active</span>
          </div>
        </div>
      </div>
      {/* Recommendations - always visible */}
      <div className="bg-gray-50 rounded-2xl shadow-inner p-4 border border-gray-100">
        <div className="text-indigo-900 text-lg font-bold mb-2">Recommended Songs</div>
        {recommendedSongs.filter(song => !currentSong || song.id !== currentSong.id).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedSongs.filter(song => !currentSong || song.id !== currentSong.id).map(song => (
              <div
                key={song.id}
                className={`rounded-xl p-3 border shadow-sm flex flex-col items-start transition-all duration-300 bg-white border-gray-200`}
              >
                <div className="font-semibold text-indigo-800 text-base mb-1">{song.title}</div>
                <div className="text-xs text-gray-500 mb-2">{song.artist}</div>
                <button
                  className="mt-auto px-4 py-1 rounded-full bg-yellow-400 text-indigo-900 font-bold shadow hover:bg-yellow-300 transition-colors text-sm"
                  onClick={() => onRecommendSong && onRecommendSong(song)}
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-indigo-400 text-center py-4 font-medium">No recommended songs for this emotion yet.</div>
        )}
      </div>
    </div>
  );
};