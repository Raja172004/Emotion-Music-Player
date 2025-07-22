import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiSong, ApiEmotionDetectionResponse } from '../services/api';
import { Song, EmotionType, EmotionData } from '../types';

export const useBackendIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Test backend connection
  const testConnection = useCallback(async () => {
    try {
      await apiService.getAllSongs();
      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  }, []);

  useEffect(() => {
    testConnection();
    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, [testConnection]);

  // Convert API song to frontend song format
  const convertApiSongToSong = (apiSong: ApiSong): Song => ({
    id: apiSong.id.toString(),
    title: apiSong.title,
    artist: apiSong.artist,
    url: apiService.getSongStreamUrl(apiSong.id),
    emotion: apiSong.emotionCategory.toLowerCase() as EmotionType,
    duration: apiSong.duration || 0,
  });

  // Load songs from backend
  const loadSongs = useCallback(async (): Promise<Song[]> => {
    try {
      const apiSongs = await apiService.getAllSongs();
      return apiSongs.map(convertApiSongToSong);
    } catch (error) {
      console.error('Failed to load songs from backend:', error);
      return [];
    }
  }, []);

  // Upload song to backend
  const uploadSong = useCallback(async (
    file: File, 
    title: string, 
    artist: string, 
    emotion: EmotionType
  ): Promise<Song | null> => {
    try {
      const apiSong = await apiService.uploadSong(file, title, artist, emotion);
      return convertApiSongToSong(apiSong);
    } catch (error) {
      console.error('Failed to upload song:', error);
      return null;
    }
  }, []);

  // Detect emotion using backend
  const detectEmotion = useCallback(async (
    imageData: string, 
    sessionId: string
  ): Promise<EmotionData | null> => {
    try {
      const response = await apiService.detectEmotion({ imageData, sessionId });
      return {
        emotion: response.emotion.toLowerCase() as EmotionType,
        confidence: response.confidence,
        timestamp: response.timestamp,
      };
    } catch (error) {
      console.error('Failed to detect emotion:', error);
      return null;
    }
  }, []);

  // Get songs by emotion
  const getSongsByEmotion = useCallback(async (emotion: EmotionType): Promise<Song[]> => {
    try {
      const apiSongs = await apiService.getSongsByEmotion(emotion);
      return apiSongs.map(convertApiSongToSong);
    } catch (error) {
      console.error('Failed to get songs by emotion:', error);
      return [];
    }
  }, []);

  // Get recommended songs for current emotion
  const getRecommendedSongs = useCallback(async (emotion: EmotionType): Promise<Song[]> => {
    try {
      // Try to get songs specifically for this emotion
      const emotionSongs = await apiService.getSongsByEmotion(emotion);
      if (emotionSongs.length > 0) {
        return emotionSongs.map(convertApiSongToSong);
      }
      
      // If no songs for this emotion, get random songs
      const randomSongs = await apiService.getRandomSongsByEmotion(emotion);
      return randomSongs.map(convertApiSongToSong);
    } catch (error) {
      console.error('Failed to get recommended songs:', error);
      return [];
    }
  }, []);

  return {
    isConnected,
    connectionError,
    testConnection,
    loadSongs,
    uploadSong,
    detectEmotion,
    getSongsByEmotion,
    getRecommendedSongs,
  };
};