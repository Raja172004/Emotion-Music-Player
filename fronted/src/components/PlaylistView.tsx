import React from 'react';
import { Play, Pause, Music, Download, RefreshCw } from 'lucide-react';
import { Song, EmotionType } from '../types';
import { getEmotionColor, getEmotionIcon, formatTime } from '../utils/audioUtils';

interface PlaylistViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  filterEmotion: EmotionType | 'all';
  onSongSelect: (song: Song) => void;
  onEmotionFilter: (emotion: EmotionType | 'all') => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  filterEmotion,
  onSongSelect,
  onEmotionFilter,
  isLoading = false,
  onRefresh
}) => {
  const emotions: (EmotionType | 'all')[] = ['all', 'happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'];
  
  const filteredSongs = filterEmotion === 'all' 
    ? songs 
    : songs.filter(song => song.emotion === filterEmotion);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
        <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 flex items-center">
          <Music className="mr-2 text-amber-400" size={20} sm:size={24} />
          Music Library
        </h3>
        <div className="flex items-center space-x-2">
          <div className="text-sm sm:text-base text-gray-700 font-semibold">
            {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-full bg-gray-100 text-indigo-700 hover:bg-amber-100 hover:text-amber-500 transition-colors disabled:opacity-50 shadow"
              title="Refresh songs"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>
      
      {/* Emotion Filter */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
        {emotions.map(emotion => (
          <button
            key={emotion}
            onClick={() => onEmotionFilter(emotion)}
            className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-base font-semibold transition-all duration-200 shadow ${
              filterEmotion === emotion
                ? 'bg-amber-400 text-indigo-700 scale-105'
                : 'bg-white text-indigo-700 border border-indigo-700 hover:bg-amber-50 hover:text-amber-500'
            }`}
          >
            {emotion === 'all' ? 'All' : `${getEmotionIcon(emotion)} ${emotion}`}
          </button>
        ))}
      </div>

      {/* Songs List */}
      <div className="space-y-3 sm:space-y-4 max-h-60 sm:max-h-80 md:max-h-[32rem] overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-indigo-700 py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-amber-400 mx-auto mb-3 sm:mb-4"></div>
            <p className="font-semibold text-base sm:text-lg">Loading songs...</p>
            <p className="text-xs sm:text-sm text-amber-500 mt-1">Fetching music from backend</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center text-indigo-700 py-6 sm:py-8">
            <Music className="mx-auto mb-2 text-amber-400" size={28} sm:size={36} />
            {filterEmotion === 'all' ? (
              <div>
                <p className="font-semibold text-base sm:text-lg">No songs uploaded yet</p>
                <p className="text-xs sm:text-sm text-amber-500 mt-1">Go to Upload tab to add music</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-base sm:text-lg">No {filterEmotion} songs found</p>
                <p className="text-xs sm:text-sm text-amber-500 mt-1">Try uploading songs with {filterEmotion} emotion</p>
              </div>
            )}
          </div>
        ) : (
          filteredSongs.map(song => {
            const isCurrentSong = currentSong?.id === song.id;
            const emotionColor = getEmotionColor(song.emotion);
            
            return (
              <div
                key={song.id}
                onClick={() => onSongSelect(song)}
                className={`flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border shadow-sm ${
                  isCurrentSong 
                    ? 'bg-amber-50 border-amber-400 scale-105' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-amber-200'
                }`}
              >
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold relative shadow"
                  style={{ backgroundColor: emotionColor + '20', color: emotionColor }}
                >
                  {isCurrentSong && isPlaying ? (
                    <Pause size={18} sm:size={22} />
                  ) : isCurrentSong ? (
                    <Play size={18} sm:size={22} />
                  ) : (
                    song.title.charAt(0).toUpperCase()
                  )}
                  
                  {/* Emotion indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs bg-amber-400 text-indigo-700 font-bold shadow">
                    {getEmotionIcon(song.emotion)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <p className={`font-bold truncate text-base sm:text-lg ${isCurrentSong ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {song.title}
                  </p>
                  <p className="text-amber-500 text-xs sm:text-sm truncate font-semibold">{song.artist}</p>
                  <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 mt-1">
                    <span className="text-xs font-bold px-2 sm:px-3 py-1 rounded-full bg-amber-400 text-indigo-700 shadow">
                      {song.emotion}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                  {isCurrentSong && (
                    <div className="w-2 h-2 bg-indigo-700 rounded-full animate-pulse"></div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle download or other action
                    }}
                    className="p-2 rounded-full bg-gray-100 text-indigo-700 hover:bg-amber-100 hover:text-amber-500 transition-colors shadow"
                  >
                    <Download size={16} sm:size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Debug Info */}
      {songs.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-2xl shadow-inner">
          <div className="text-xs sm:text-sm text-indigo-700 space-y-1">
            <div>Total songs in library: {songs.length}</div>
            <div>Filtered songs: {filteredSongs.length}</div>
            <div>Current filter: {filterEmotion}</div>
            {currentSong && (
              <div>Now playing: {currentSong.title}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};