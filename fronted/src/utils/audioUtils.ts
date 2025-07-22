export const createAudioFromFile = (file: File): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio file'));
    });
    
    audio.src = url;
  });
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getEmotionColor = (emotion: string): string => {
  const colors = {
    happy: '#F59E0B',
    sad: '#3B82F6', 
    angry: '#EF4444',
    surprise: '#8B5CF6',
    fear: '#6B7280',
    disgust: '#10B981',
    neutral: '#6B7280'
  };
  return colors[emotion as keyof typeof colors] || '#6B7280';
};

export const getEmotionIcon = (emotion: string): string => {
  const icons = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprise: '😮',
    fear: '😨',
    disgust: '🤢',
    neutral: '😐'
  };
  return icons[emotion as keyof typeof icons] || '😐';
};