import React, { useState, useEffect } from 'react';
import { Music, Brain, Upload, Wifi, WifiOff } from 'lucide-react';
import { Song, EmotionType, PlayerState } from './types';
import { useRealEmotionDetection } from './hooks/useRealEmotionDetection';
import { useBackendIntegration } from './hooks/useBackendIntegration';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createAudioFromFile } from './utils/audioUtils';
import { EmotionDisplay } from './components/EmotionDisplay';
import { CameraView } from './components/CameraView';
import { FileUpload } from './components/FileUpload';
import { MusicPlayer } from './components/MusicPlayer';
import { PlaylistView } from './components/PlaylistView';
import Login from './components/Login';
import Register from './components/Register';
import { logoutUser } from './services/api';
import { apiService } from './services/api';

function App() {
  // Replace useLocalStorage with useState to prevent race conditions
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<'player' | 'upload'>('player');
  const [isEmotionActive, setIsEmotionActive] = useState(false);
  const [filterEmotion, setFilterEmotion] = useState<EmotionType | 'all'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [recommendationNotification, setRecommendationNotification] = useState<string | null>(null);
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('emotion-music-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showLogin, setShowLogin] = useState(true);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    volume: 0.7,
    shuffle: false,
    repeat: false
  });

  const { currentEmotion, isDetecting, error, videoRef, isBackendConnected, performEmotionDetection } = useRealEmotionDetection(isEmotionActive);
  const { isConnected, connectionError, loadSongs, uploadSong, getSongsByEmotion, getRecommendedSongs } = useBackendIntegration();

  // Load songs from backend on startup
  useEffect(() => {
    if (isConnected) {
      console.log('🔄 Loading songs from backend...');
      setIsLoadingSongs(true);
      loadSongs().then(backendSongs => {
        console.log('✅ Loaded songs from backend:', backendSongs.length);
        setSongs(backendSongs);
        // Update localStorage with backend data
        window.localStorage.setItem('emotion-music-songs', JSON.stringify(backendSongs));
        console.log('📝 Songs loaded:', backendSongs.map(s => s.title));
      }).catch(error => {
        console.error('❌ Failed to load songs:', error);
        // If backend fails, try to load from localStorage as fallback
        try {
          const cachedSongs = localStorage.getItem('emotion-music-songs');
          if (cachedSongs) {
            const parsedSongs = JSON.parse(cachedSongs);
            setSongs(parsedSongs);
            console.log('📦 Loaded songs from cache:', parsedSongs.length);
          }
        } catch (cacheError) {
          console.error('❌ Failed to load from cache:', cacheError);
        }
      }).finally(() => {
        setIsLoadingSongs(false);
      });
    }
  }, [isConnected, loadSongs]);

  const currentPlaylist = filterEmotion === 'all' 
    ? songs 
    : songs.filter(song => song.emotion === filterEmotion);

  // Calculate recommended songs based on current emotion
  const recommendedSongs = currentEmotion 
    ? songs.filter(song => song.emotion === currentEmotion.emotion)
    : [];

  // Auto-recommend songs based on detected emotion
  useEffect(() => {
    console.log('🔄 Auto-recommendation check:', {
      currentEmotion,
      recommendedSongsCount: recommendedSongs.length,
      totalSongs: songs.length,
      currentSong: playerState.currentSong?.title,
      isPlaying: playerState.isPlaying
    });

    if (currentEmotion && recommendedSongs.length > 0) {
      // Auto-recommend if no song is selected
      if (!playerState.currentSong) {
        const recommendedSong = recommendedSongs[Math.floor(Math.random() * recommendedSongs.length)];
        console.log(`🎵 Auto-recommending "${recommendedSong.title}" for ${currentEmotion.emotion} emotion`);
        setPlayerState(prev => ({ 
          ...prev, 
          currentSong: recommendedSong,
          isPlaying: true // Auto-play the recommended song
        }));
        setRecommendationNotification(`🎵 Auto-playing "${recommendedSong.title}" for your ${currentEmotion.emotion} mood!`);
        setTimeout(() => setRecommendationNotification(null), 5000);
      }
      // If a song is selected but not playing, do not force play (user may have paused)
    } else if (currentEmotion && recommendedSongs.length === 0) {
      console.log(`⚠️ No songs found for ${currentEmotion.emotion} emotion`);
      if (songs.length > 0 && !playerState.currentSong) {
        const fallbackSong = songs[Math.floor(Math.random() * songs.length)];
        console.log(`🎵 No ${currentEmotion.emotion} songs available, playing fallback: "${fallbackSong.title}"`);
        setPlayerState(prev => ({ 
          ...prev, 
          currentSong: fallbackSong,
          isPlaying: true
        }));
        setRecommendationNotification(`🎵 Playing "${fallbackSong.title}" (no ${currentEmotion.emotion} songs available)`);
        setTimeout(() => setRecommendationNotification(null), 5000);
      }
    } else if (!currentEmotion) {
      console.log('🎭 No emotion detected yet');
    }
  }, [currentEmotion, recommendedSongs, songs, playerState.currentSong]);

  const handleFileUpload = async (files: File[], emotions: EmotionType[]) => {
    setIsUploading(true);
    
    try {
      const newSongs: Song[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const emotion = emotions[i] || 'neutral'; // Use provided emotion or default to neutral
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          console.warn(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        try {
          // Extract metadata
          const title = file.name.replace(/\.[^/.]+$/, "");
          const artist = "Unknown Artist";
          
          console.log(`📤 Uploading ${title} with emotion: ${emotion}`);
          
          if (isConnected) {
            // Upload to backend
            const backendSong = await uploadSong(file, title, artist, emotion);
            if (backendSong) {
              newSongs.push(backendSong);
              console.log(`✅ Successfully uploaded: ${title} (${emotion})`);
            }
          } else {
            // Fallback to local storage
            const audio = await createAudioFromFile(file);
            const url = URL.createObjectURL(file);
            
            const song: Song = {
              id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title,
              artist,
              url,
              emotion,
              duration: audio.duration || 0,
              file
            };
            
            newSongs.push(song);
            console.log(`✅ Added to local storage: ${title} (${emotion})`);
          }
        } catch (error) {
          console.error(`❌ Error processing file ${file.name}:`, error);
        }
      }
      
      setSongs(prev => {
        const newSongsList = [...prev, ...newSongs];
        // Update localStorage with new song list
        window.localStorage.setItem('emotion-music-songs', JSON.stringify(newSongsList));
        return newSongsList;
      });
      console.log(`🎉 Uploaded ${newSongs.length} songs successfully`);
      
      // Show success notification
      setRecommendationNotification(`🎉 Successfully uploaded ${newSongs.length} song${newSongs.length !== 1 ? 's' : ''}!`);
      setTimeout(() => setRecommendationNotification(null), 5000);
      
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayerStateChange = (changes: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...changes }));
  };

  const handleSongChange = (song: Song) => {
    setPlayerState(prev => ({ ...prev, currentSong: song }));
  };

  const handleRefreshSongs = async () => {
    if (isConnected) {
      setIsLoadingSongs(true);
      try {
        const backendSongs = await loadSongs();
        setSongs(backendSongs);
        // Update localStorage with fresh backend data
        window.localStorage.setItem('emotion-music-songs', JSON.stringify(backendSongs));
        console.log('🔄 Refreshed songs:', backendSongs.length);
      } catch (error) {
        console.error('❌ Failed to refresh songs:', error);
      } finally {
        setIsLoadingSongs(false);
      }
    }
  };

  // Debug logging for emotion matching
  useEffect(() => {
    if (currentEmotion) {
      console.log('🎭 Emotion matching debug:', {
        detectedEmotion: currentEmotion.emotion,
        detectedConfidence: currentEmotion.confidence,
        availableEmotions: [...new Set(songs.map(s => s.emotion))],
        songsForEmotion: songs.filter(s => s.emotion === currentEmotion.emotion),
        totalSongs: songs.length
      });
    }
  }, [currentEmotion, songs]);

  // Calculate emotion distribution statistics
  const emotionStats = songs.reduce((acc, song) => {
    acc[song.emotion] = (acc[song.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSongs = songs.length;

  // Add a handler to delete all songs (call this from a button or dev tool)
  const handleDeleteAllSongs = async () => {
    if (isConnected) {
      try {
        console.log('🗑️ Deleting all songs from backend...');
        await fetch('/api/songs/all', { method: 'DELETE' });
        console.log('✅ Backend songs deleted');
        
        // Clear localStorage first
        window.localStorage.removeItem('emotion-music-songs');
        console.log('🗑️ LocalStorage cleared');
        
        // Reset songs state to empty array
        setSongs([]);
        console.log('🔄 Songs state reset to empty');
        
        // Clear current song from player to prevent 500 errors
        setPlayerState(prev => ({ 
          ...prev, 
          currentSong: null,
          isPlaying: false,
          currentTime: 0
        }));
        console.log('🎵 Player state cleared');
        
        // Re-fetch from backend to confirm
        const backendSongs = await loadSongs();
        console.log('📋 Backend now has', backendSongs.length, 'songs');
        setSongs(backendSongs);
        
        // Show notification
        setRecommendationNotification('🗑️ All songs deleted successfully!');
        setTimeout(() => setRecommendationNotification(null), 3000);
        
      } catch (error) {
        console.error('❌ Error deleting songs:', error);
        setRecommendationNotification('❌ Error deleting songs');
        setTimeout(() => setRecommendationNotification(null), 3000);
      }
    }
  };

  // Expose clear function globally for manual use
  useEffect(() => {
    (window as any).clearMusicCache = () => {
      // Clear localStorage
      window.localStorage.removeItem('emotion-music-songs');
      // Clear songs state
      setSongs([]);
      // Clear player state
      setPlayerState(prev => ({ 
        ...prev, 
        currentSong: null,
        isPlaying: false,
        currentTime: 0
      }));
      console.log('🗑️ Music cache and player state cleared manually');
      // Force re-fetch from backend
      if (isConnected) {
        handleRefreshSongs();
      }
    };
  }, [isConnected, handleRefreshSongs]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('emotion-music-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('emotion-music-user');
    }
  }, [user]);

  // Helper to check if user is admin
  const isAdmin = user && user.roles && user.roles.includes('ADMIN');

  // Attach token to all fetch requests
  useEffect(() => {
    if (!user || !user.token) return;
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        init.headers = {
          ...(init.headers || {}),
          'Authorization': `Bearer ${user.token}`
        };
      }
      return originalFetch(input, init);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50">
        <div className="w-full max-w-md">
          {showLogin ? <Login onLogin={setUser} onToggle={() => setShowLogin(false)} /> : <Register onRegister={setUser} onToggle={() => setShowLogin(true)} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-10">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="flex flex-col items-center mb-4">
            <div className="p-4 sm:p-5 bg-yellow-400 rounded-full mb-3 shadow-xl border-4 border-white">
              <Music className="text-indigo-900" size={40} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-indigo-900 mb-2 tracking-tight drop-shadow">Emotion Music Player</h1>
            <div className="w-20 sm:w-28 h-1 bg-yellow-400 rounded-full mb-2"></div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-indigo-700">
                  <Wifi size={16} />
                  <span className="text-xs font-semibold">Backend Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-500">
                  <WifiOff size={16} />
                  <span className="text-xs font-semibold">Offline Mode</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-base sm:text-lg font-medium">
            {isConnected ? 'AI-powered music with real-time emotion detection' : 'AI-powered music (offline mode)'}
          </p>
          {connectionError && (
            <p className="text-yellow-500 text-sm mt-2">Backend: {connectionError}</p>
          )}
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-white border border-gray-100 rounded-full p-1 sm:p-2 shadow-lg flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-4 sm:px-8 py-2 rounded-full font-bold text-base sm:text-lg transition-all duration-200 border-2 focus:outline-none ${
                activeTab === 'player'
                  ? 'border-yellow-400 text-indigo-900 bg-yellow-50 shadow'
                  : 'border-transparent text-gray-400 hover:text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <Music className="inline mr-1 sm:mr-2" size={18} />
              Player
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 sm:px-8 py-2 rounded-full font-bold text-base sm:text-lg transition-all duration-200 border-2 focus:outline-none ${
                activeTab === 'upload'
                  ? 'border-yellow-400 text-indigo-900 bg-yellow-50 shadow'
                  : 'border-transparent text-gray-400 hover:text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <Upload className="inline mr-1 sm:mr-2" size={18} />
              Upload
            </button>
          </div>
        </div>

        {/* Recommendation Notification */}
        {recommendationNotification && (
          <div className="fixed top-4 right-2 sm:top-6 sm:right-6 bg-indigo-900 text-yellow-400 px-4 sm:px-7 py-3 sm:py-4 rounded-2xl shadow-2xl z-50 animate-fade-in">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl">🎵</span>
              <span className="font-bold text-base sm:text-lg">{recommendationNotification}</span>
            </div>
          </div>
        )}

        {activeTab === 'player' ? (
          <>
            {/* Always mount CameraView, but control its position/visibility with Tailwind classes */}
            {/* Mobile: show CameraView at the top; Desktop: hide here */}
            <div className="block lg:hidden mb-4">
              <CameraView
                videoRef={videoRef}
                isActive={isEmotionActive}
                error={error}
                onToggle={() => setIsEmotionActive(!isEmotionActive)}
              />
            </div>
            {/* Main content grid: on desktop, show CameraView in the middle column; on mobile, hide here */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start min-h-[600px] w-full">
              {/* Left Column - Emotion Detection */}
              <div className="flex flex-col space-y-4 h-full w-full max-w-full">
                <EmotionDisplay 
                  emotion={currentEmotion} 
                  isDetecting={isDetecting}
                  recommendedSongs={recommendedSongs}
                  currentSong={playerState.currentSong}
                  onRecommendSong={(song) => {
                    setPlayerState(prev => ({ 
                      ...prev, 
                      currentSong: song,
                      isPlaying: true
                    }));
                    setRecommendationNotification(`🎵 Playing "${song.title}" for your ${currentEmotion?.emotion} mood!`);
                    setTimeout(() => setRecommendationNotification(null), 5000);
                  }}
                />
                {isEmotionActive && (
                  <div className="bg-indigo-100 border border-indigo-200 rounded-xl p-3 sm:p-4 w-full max-w-full">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-indigo-700 font-medium text-sm sm:text-base">Emotion Detection Active</span>
                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-center text-xs sm:text-sm text-indigo-400 mt-1">
                      Analyzing facial expressions every 5 seconds
                    </div>
                  </div>
                )}
                {isBackendConnected && (
                  <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-2 sm:p-3 w-full max-w-full">
                    <div className="flex items-center space-x-1 sm:space-x-2 text-indigo-700 text-xs sm:text-sm">
                      <Wifi size={14} />
                      <span>Real-time emotion detection active</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Middle Column - Camera Feed and Music Player */}
              <div className="flex flex-col space-y-4 h-full w-full max-w-full">
                {/* Desktop: show CameraView here; Mobile: hide */}
                <div className="hidden lg:block">
                  <CameraView
                    videoRef={videoRef}
                    isActive={isEmotionActive}
                    error={error}
                    onToggle={() => setIsEmotionActive(!isEmotionActive)}
                  />
                </div>
                <button
                  onClick={performEmotionDetection}
                  className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-yellow-400 font-bold rounded-full shadow transition-all duration-300 text-sm sm:text-base"
                  disabled={!isEmotionActive || isDetecting}
                >
                  Refresh Emotion
                </button>
                {/* Play Recommended Song Button */}
                <button
                  className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold rounded-full shadow transition-all duration-300 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={
                    !currentEmotion ||
                    recommendedSongs.filter(song => !playerState.currentSong || song.id !== playerState.currentSong.id).length === 0
                  }
                  onClick={() => {
                    if (!currentEmotion) return;
                    const available = recommendedSongs.filter(song => !playerState.currentSong || song.id !== playerState.currentSong.id);
                    if (available.length > 0) {
                      const randomRecommended = available[Math.floor(Math.random() * available.length)];
                      setPlayerState(prev => ({
                        ...prev,
                        currentSong: randomRecommended,
                        isPlaying: true
                      }));
                      setRecommendationNotification(`🎵 Playing "${randomRecommended.title}" for your ${currentEmotion.emotion} mood!`);
                      setTimeout(() => setRecommendationNotification(null), 5000);
                    }
                  }}
                >
                  Play Recommended Song
                </button>
                <MusicPlayer
                  currentSong={playerState.currentSong}
                  playlist={currentPlaylist}
                  playerState={playerState}
                  onStateChange={handlePlayerStateChange}
                  onSongChange={handleSongChange}
                  recommendedSongs={recommendedSongs}
                  currentEmotion={currentEmotion}
                />
              </div>
              {/* Right Column - Playlist */}
              <div className="flex flex-col h-full w-full max-w-full">
                <PlaylistView
                  songs={songs}
                  currentSong={playerState.currentSong}
                  isPlaying={playerState.isPlaying}
                  filterEmotion={filterEmotion}
                  onSongSelect={handleSongChange}
                  onEmotionFilter={setFilterEmotion}
                  isLoading={isLoadingSongs}
                  onRefresh={handleRefreshSongs}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-full sm:max-w-2xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
            {/* Admin/Dev: Delete All Songs Button */}
            {isConnected && user && isAdmin && (
              <button
                onClick={handleDeleteAllSongs}
                className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all duration-300 text-sm sm:text-base"
              >
                Delete All Songs (Admin/Dev)
              </button>
            )}
            
            {/* Emotion Distribution Statistics */}
            {totalSongs > 0 && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 shadow-lg">
                <h3 className="text-indigo-900 font-bold mb-4 flex items-center text-base sm:text-lg">
                  <span className="mr-2">📊</span>
                  Emotion Distribution ({totalSongs} songs)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'].map(emotion => {
                    const count = emotionStats[emotion] || 0;
                    const percentage = totalSongs > 0 ? Math.round((count / totalSongs) * 100) : 0;
                    const getEmotionIcon = (e: string) => {
                      const icons: Record<string, string> = {
                        happy: '😊', sad: '😢', angry: '😠', surprise: '😮',
                        fear: '😨', disgust: '🤢', neutral: '😐'
                      };
                      return icons[e] || '😐';
                    };
                    const getEmotionColor = (e: string) => {
                      const colors: Record<string, string> = {
                        happy: '#F59E0B', sad: '#3B82F6', angry: '#EF4444',
                        surprise: '#8B5CF6', fear: '#6B7280', disgust: '#10B981', neutral: '#6B7280'
                      };
                      return colors[e] || '#6B7280';
                    };
                    return (
                      <div key={emotion} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        <div className="text-2xl mb-1" style={{ color: getEmotionColor(emotion) }}>{getEmotionIcon(emotion)}</div>
                        <div className="font-semibold text-indigo-900 text-sm capitalize">{emotion}</div>
                        <div className="text-gray-400 text-xs">{count} songs</div>
                        <div className="w-full mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: getEmotionColor(emotion) 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
                  💡 Tip: Upload songs across all emotions for better recommendations!
                </div>
              </div>
            )}
            
            {songs.length > 0 && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 shadow-lg">
                <h3 className="text-indigo-900 font-bold mb-4 text-base sm:text-lg flex items-center">
                  <span className="mr-2">🎵</span>
                  {isConnected ? 'Songs in Database' : 'Local Songs'} ({songs.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {songs.map(song => {
                    const getEmotionIcon = (e: string) => {
                      const icons: Record<string, string> = {
                        happy: '😊', sad: '😢', angry: '😠', surprise: '😮',
                        fear: '😨', disgust: '🤢', neutral: '😐'
                      };
                      return icons[e] || '😐';
                    };
                    const getEmotionColor = (e: string) => {
                      const colors: Record<string, string> = {
                        happy: '#F59E0B', sad: '#3B82F6', angry: '#EF4444',
                        surprise: '#8B5CF6', fear: '#6B7280', disgust: '#10B981', neutral: '#6B7280'
                      };
                      return colors[e] || '#6B7280';
                    };
                    return (
                      <div key={song.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold relative shadow" style={{ backgroundColor: getEmotionColor(song.emotion) + '20', color: getEmotionColor(song.emotion) }}>
                          {getEmotionIcon(song.emotion)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-indigo-900 text-base sm:text-lg">{song.title}</p>
                          <p className="text-gray-500 text-xs sm:text-sm truncate font-semibold">{song.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: getEmotionColor(song.emotion), color: '#fff' }}>
                              {song.emotion}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 md:mt-16 text-center text-indigo-700">
          <p className="flex items-center justify-center space-x-2 text-sm sm:text-base">
            <Brain size={16} />
            <span>
              {isConnected 
                ? 'Powered by Spring Boot backend with real AI emotion detection' 
                : 'Powered by AI emotion detection technology (offline mode)'
              }
            </span>
          </p>
        </footer>

        {/* Logout button */}
        <div className="flex justify-center mt-8 md:mt-10">
          <button
            onClick={handleLogout}
            className="px-6 sm:px-8 py-2 rounded-full font-bold bg-yellow-400 text-indigo-900 shadow hover:bg-yellow-300 transition-colors text-base sm:text-lg border-2 border-yellow-400 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;