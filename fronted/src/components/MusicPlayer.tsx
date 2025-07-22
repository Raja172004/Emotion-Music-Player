import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music } from 'lucide-react';
import { Song, PlayerState } from '../types';
import { formatTime, getEmotionColor } from '../utils/audioUtils';

interface MusicPlayerProps {
  currentSong: Song | null;
  playlist: Song[];
  playerState: PlayerState;
  onStateChange: (state: Partial<PlayerState>) => void;
  onSongChange: (song: Song) => void;
  recommendedSongs?: Song[];
  currentEmotion?: { emotion: string; confidence: number } | null;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  playlist,
  playerState,
  onStateChange,
  onSongChange,
  recommendedSongs = [],
  currentEmotion
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      onStateChange({ currentTime: audio.currentTime });
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      // Clear current song if there's an error (like 500 status)
      onSongChange(null);
      onStateChange({ isPlaying: false, currentTime: 0 });
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.isPlaying) {
      if (audio.readyState >= 2) {
        audio.play().catch((err) => {
          console.warn('Audio play() failed:', err);
        });
      } else {
        const onReady = () => {
          audio.play().catch((err) => {
            console.warn('Audio play() failed after ready:', err);
          });
          audio.removeEventListener('loadedmetadata', onReady);
        };
        audio.addEventListener('loadedmetadata', onReady);
      }
    } else {
      audio.pause();
    }
  }, [playerState.isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playerState.isPlaying && audio.readyState >= 2) {
      audio.play().catch((err) => {
        console.warn('Audio play() failed after song change:', err);
      });
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = playerState.volume;
    }
  }, [playerState.volume]);

  const handlePlayPause = () => {
    onStateChange({ isPlaying: !playerState.isPlaying });
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
    let nextIndex;
    if (playerState.shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    onSongChange(playlist[nextIndex]);
    onStateChange({ isPlaying: true });
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
    let prevIndex;
    if (playerState.shuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }
    onSongChange(playlist[prevIndex]);
    onStateChange({ isPlaying: true });
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    onStateChange({ currentTime: newTime });
  };

  if (!currentSong) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200 flex flex-col space-y-4">
        <div className="text-center text-amber-500">
          <div className="mb-4">
            <Music className="mx-auto text-indigo-700" size={36} sm:size={40} md:size={48} />
          </div>
          <p className="font-bold mb-2 text-base sm:text-lg">No song selected</p>
          <p className="text-xs sm:text-sm text-amber-500 mb-4">Choose a song from the playlist to start playing</p>
          {/* Smart Recommendations */}
          {currentEmotion && recommendedSongs.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 shadow">
                <p className="text-xs sm:text-sm text-indigo-700 mb-2 font-semibold">
                  🎭 Detected: <span className="font-bold capitalize">{currentEmotion.emotion}</span> 
                  ({Math.round(currentEmotion.confidence)}% confidence)
                </p>
                <button
                  onClick={() => {
                    const randomRecommended = recommendedSongs[Math.floor(Math.random() * recommendedSongs.length)];
                    onSongChange(randomRecommended);
                    onStateChange({ isPlaying: true });
                  }}
                  className="w-full py-2 bg-indigo-700 text-amber-400 font-bold rounded-full shadow hover:scale-105 hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                >
                  🎵 Play Recommended Song
                </button>
              </div>
            </div>
          )}
          {/* Fallback if no emotion detected or no recommended songs */}
          {(!currentEmotion || recommendedSongs.length === 0) && playlist.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-amber-50 rounded-2xl p-3 sm:p-4 shadow">
                <p className="text-xs sm:text-sm text-amber-700 mb-2 font-semibold">
                  {!currentEmotion ? "🎭 No emotion detected yet" : "🎵 No songs for current emotion"}
                </p>
                <button
                  onClick={() => {
                    const randomSong = playlist[Math.floor(Math.random() * playlist.length)];
                    onSongChange(randomSong);
                    onStateChange({ isPlaying: true });
                  }}
                  className="w-full py-2 bg-amber-400 text-indigo-700 font-bold rounded-full shadow hover:scale-105 hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                >
                  🎵 Play Random Song
                </button>
              </div>
            </div>
          )}
          {/* No songs available */}
          {playlist.length === 0 && (
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-inner">
              <p className="text-xs sm:text-sm text-gray-500 font-semibold">
                📁 No songs available. Upload some music in the Upload tab!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const emotionColor = getEmotionColor(currentSong.emotion);
  const progress = duration > 0 ? (playerState.currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200">
      <audio ref={audioRef} src={currentSong.url} />
      
      {/* Song Info */}
      <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-6 sm:mb-8">
        <div 
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shadow"
          style={{ backgroundColor: emotionColor + '20', color: emotionColor }}
        >
          {currentSong.title.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3 className="text-gray-800 font-semibold truncate text-base sm:text-lg">{currentSong.title}</h3>
          <p className="text-gray-500 truncate text-xs sm:text-sm">{currentSong.artist}</p>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{currentSong.emotion} mood</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <div 
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: emotionColor
            }}
          />
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-gray-400 mt-1">
          <span>{formatTime(playerState.currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-3 sm:mb-4">
        <button
          onClick={() => onStateChange({ shuffle: !playerState.shuffle })}
          className={`p-2 rounded-lg transition-colors text-base sm:text-lg ${
            playerState.shuffle 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shuffle size={18} sm:size={20} />
        </button>
        
        <button
          onClick={handlePrevious}
          className="p-2 text-gray-400 hover:text-white transition-colors text-base sm:text-lg"
        >
          <SkipBack size={20} sm:size={24} />
        </button>
        
        <button
          onClick={handlePlayPause}
          className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 text-lg sm:text-xl"
        >
          {playerState.isPlaying ? <Pause size={20} sm:size={24} /> : <Play size={20} sm:size={24} />}
        </button>
        
        <button
          onClick={handleNext}
          className="p-2 text-gray-400 hover:text-white transition-colors text-base sm:text-lg"
        >
          <SkipForward size={20} sm:size={24} />
        </button>
        
        <button
          onClick={() => onStateChange({ repeat: !playerState.repeat })}
          className={`p-2 rounded-lg transition-colors text-base sm:text-lg ${
            playerState.repeat 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Repeat size={18} sm:size={20} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Volume2 className="text-gray-400" size={18} sm:size={20} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={playerState.volume}
          onChange={(e) => onStateChange({ volume: parseFloat(e.target.value) })}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
};