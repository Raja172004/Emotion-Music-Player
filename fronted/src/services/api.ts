export interface ApiSong {
  id: number;
  title: string;
  artist: string;
  emotionCategory: string;
  filePath: string;
  fileSize: number;
  duration: number;
  mimeType: string;
}

export interface ApiEmotionDetectionRequest {
  imageData: string; // Base64 encoded image
  sessionId: string;
}

export interface ApiEmotionDetectionResponse {
  emotion: string;
  confidence: number;
  timestamp: number;
  sessionId: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage += ` - ${errorBody}`;
        }
      } catch (e) {
        // Ignore error reading response body
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Song endpoints
  async getAllSongs(): Promise<ApiSong[]> {
    return this.request<ApiSong[]>('/api/songs');
  }

  async getSongsByEmotion(emotion: string): Promise<ApiSong[]> {
    return this.request<ApiSong[]>(`/api/songs/emotion/${emotion}`);
  }

  async getRandomSongsByEmotion(emotion: string): Promise<ApiSong[]> {
    return this.request<ApiSong[]>(`/api/songs/emotion/${emotion}/random`);
  }

  async uploadSong(file: File, title: string, artist: string, emotion: string): Promise<ApiSong> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('emotion', emotion);

    const response = await fetch(`/api/songs`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  getSongStreamUrl(songId: number): string {
    return `/api/songs/${songId}/stream`;
  }

  async deleteSong(songId: number): Promise<void> {
    await this.request(`/api/songs/${songId}`, {
      method: 'DELETE',
    });
  }

  async searchSongs(query: string): Promise<ApiSong[]> {
    return this.request<ApiSong[]>(`/api/songs/search?q=${encodeURIComponent(query)}`);
  }

  // Emotion detection endpoints
  async detectEmotion(request: ApiEmotionDetectionRequest): Promise<ApiEmotionDetectionResponse> {
    return this.request<ApiEmotionDetectionResponse>('/api/emotion/detect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getEmotionStatistics(): Promise<Record<string, number>> {
    return this.request<Record<string, number>>('/api/emotion/statistics');
  }

  // Playlist endpoints
  async getPlaylistByEmotion(emotion: string): Promise<ApiSong[]> {
    return this.request<ApiSong[]>(`/api/playlists/emotion/${emotion}`);
  }

  async createPlaylistForEmotion(emotion: string): Promise<ApiSong[]> {
    return this.request<ApiSong[]>(`/api/playlists/emotion/${emotion}`, {
      method: 'POST',
    });
  }

  async addSongToPlaylist(emotion: string, songId: number): Promise<void> {
    await this.request(`/api/playlists/emotion/${emotion}/songs/${songId}`, {
      method: 'POST',
    });
  }

  async removeSongFromPlaylist(emotion: string, songId: number): Promise<void> {
    await this.request(`/api/playlists/emotion/${emotion}/songs/${songId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

export async function registerUser(data: { username: string; password: string; email: string }) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function loginUser(data: { username: string; password: string }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function logoutUser() {
  // No backend call needed for stateless JWT logout
  return { message: 'Logged out locally' };
}