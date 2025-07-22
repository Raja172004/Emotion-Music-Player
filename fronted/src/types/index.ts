export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  emotion: EmotionType;
  duration: number;
  file?: File;
}

export type EmotionType = 'happy' | 'sad' | 'angry' | 'surprise' | 'fear' | 'disgust' | 'neutral';

export interface EmotionData {
  emotion: EmotionType;
  confidence: number;
  timestamp: number;
}

export interface Playlist {
  id: string;
  emotion: EmotionType;
  songs: Song[];
  createdAt: number;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
}