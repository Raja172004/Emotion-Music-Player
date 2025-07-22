import React, { useRef, useState } from 'react';
import { Upload, Music, Info, Check, X } from 'lucide-react';
import { EmotionType } from '../types';

interface FileUploadProps {
  onFileUpload: (files: File[], emotions: EmotionType[]) => void;
  isUploading: boolean;
}

interface FileWithEmotion {
  file: File;
  emotion: EmotionType;
  title: string;
  artist: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileWithEmotion[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newFiles: FileWithEmotion[] = files.map(file => ({
        file,
        emotion: 'neutral' as EmotionType, // Default emotion
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist"
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const newFiles: FileWithEmotion[] = files.map(file => ({
        file,
        emotion: 'neutral' as EmotionType,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist"
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleEmotionChange = (index: number, emotion: EmotionType) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, emotion } : item
    ));
  };

  const handleTitleChange = (index: number, title: string) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, title } : item
    ));
  };

  const handleArtistChange = (index: number, artist: string) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, artist } : item
    ));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      const files = selectedFiles.map(item => item.file);
      const emotions = selectedFiles.map(item => item.emotion);
      onFileUpload(files, emotions);
      setSelectedFiles([]);
      setUploadProgress({});
    }
  };

  // Helper function to suggest emotion based on filename
  const suggestEmotion = (filename: string): EmotionType => {
    const lowerFilename = filename.toLowerCase();
    
    // Happy keywords
    if (lowerFilename.includes('happy') || lowerFilename.includes('joy') || 
        lowerFilename.includes('upbeat') || lowerFilename.includes('cheerful') ||
        lowerFilename.includes('dance') || lowerFilename.includes('party')) {
      return 'happy';
    }
    
    // Sad keywords
    if (lowerFilename.includes('sad') || lowerFilename.includes('melancholy') || 
        lowerFilename.includes('depression') || lowerFilename.includes('tears') ||
        lowerFilename.includes('lonely') || lowerFilename.includes('heartbreak')) {
      return 'sad';
    }
    
    // Angry keywords
    if (lowerFilename.includes('angry') || lowerFilename.includes('rage') || 
        lowerFilename.includes('fury') || lowerFilename.includes('aggressive') ||
        lowerFilename.includes('metal') || lowerFilename.includes('rock')) {
      return 'angry';
    }
    
    // Surprise keywords
    if (lowerFilename.includes('surprise') || lowerFilename.includes('shock') || 
        lowerFilename.includes('wow') || lowerFilename.includes('amazing') ||
        lowerFilename.includes('incredible') || lowerFilename.includes('epic')) {
      return 'surprise';
    }
    
    // Fear keywords
    if (lowerFilename.includes('fear') || lowerFilename.includes('scary') || 
        lowerFilename.includes('horror') || lowerFilename.includes('dark') ||
        lowerFilename.includes('nightmare') || lowerFilename.includes('terror')) {
      return 'fear';
    }
    
    // Disgust keywords
    if (lowerFilename.includes('disgust') || lowerFilename.includes('hate') || 
        lowerFilename.includes('gross') || lowerFilename.includes('nasty') ||
        lowerFilename.includes('vile') || lowerFilename.includes('repulsive')) {
      return 'disgust';
    }
    
    // Default to neutral
    return 'neutral';
  };

  const autoAssignEmotions = () => {
    setSelectedFiles(prev => prev.map(item => ({
      ...item,
      emotion: suggestEmotion(item.file.name)
    })));
  };

  const getEmotionColor = (emotion: EmotionType): string => {
    const colors = {
      happy: '#F59E0B',
      sad: '#3B82F6', 
      angry: '#EF4444',
      surprise: '#8B5CF6',
      fear: '#6B7280',
      disgust: '#10B981',
      neutral: '#6B7280'
    };
    return colors[emotion] || '#6B7280';
  };

  const getEmotionIcon = (emotion: EmotionType): string => {
    const icons = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprise: '😮',
      fear: '😨',
      disgust: '🤢',
      neutral: '😐'
    };
    return icons[emotion] || '😐';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-indigo-900 font-bold text-2xl mb-6 flex items-center">
        <Music className="mr-2 text-yellow-400" size={24} />
        Upload Music
      </h3>
      
      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8">
        <div className="flex items-start space-x-3">
          <Info className="text-indigo-400 mt-0.5" size={18} />
          <div className="text-base text-indigo-700">
            <p className="font-semibold mb-1">How to upload music:</p>
            <ul className="space-y-1 text-yellow-700">
              <li>• Drag & drop audio files (MP3, WAV) below</li>
              <li>• Or click the upload area to browse files</li>
              <li>• Select emotion category for each song</li>
              <li>• Edit song title and artist if needed</li>
              <li>• Maximum file size: 10MB per file</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-indigo-400 rounded-2xl p-10 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-gray-50 mb-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-4 text-yellow-400" size={48} />
        <p className="text-indigo-900 mb-2 text-lg font-bold">Drop your music files here</p>
        <p className="text-indigo-700 text-base">or click to browse</p>
        <p className="text-yellow-700 text-xs mt-2">Supports MP3, WAV files (max 10MB)</p>
        
        {/* File types info */}
        <div className="mt-4 flex justify-center space-x-4 text-xs text-indigo-700">
          <span>🎵 MP3</span>
          <span>🎵 WAV</span>
          <span>🎵 M4A</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.m4a,audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <h4 className="text-indigo-900 font-bold mb-4">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {selectedFiles.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      className="w-full bg-white text-indigo-900 px-3 py-1 rounded-lg text-base mb-2 border border-gray-200 focus:border-yellow-400 focus:outline-none"
                      placeholder="Song Title"
                    />
                    <input
                      type="text"
                      value={item.artist}
                      onChange={(e) => handleArtistChange(index, e.target.value)}
                      className="w-full bg-white text-indigo-900 px-3 py-1 rounded-lg text-base border border-gray-200 focus:border-yellow-400 focus:outline-none"
                      placeholder="Artist"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-2 rounded-full bg-gray-100 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors ml-2"
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-indigo-700">
                    {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  
                  {/* Emotion Selection */}
                  <div className="flex space-x-1">
                    {emotions.map(emotion => (
                      <button
                        key={emotion}
                        onClick={() => handleEmotionChange(index, emotion)}
                        className={`px-2 py-1 rounded-full text-xs font-bold transition-all border-2 focus:outline-none ${
                          item.emotion === emotion
                            ? 'text-white shadow'
                            : 'text-indigo-700 hover:text-yellow-700'
                        }`}
                        style={{
                          backgroundColor: item.emotion === emotion ? getEmotionColor(emotion) : 'transparent',
                          borderColor: item.emotion === emotion ? getEmotionColor(emotion) : 'transparent'
                        }}
                        aria-label={emotion}
                      >
                        {getEmotionIcon(emotion)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Upload Button */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-base text-indigo-700">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} ready to upload
            </div>
            <div className="flex space-x-2">
              {selectedFiles.length > 1 && (
                <button
                  type="button"
                  onClick={autoAssignEmotions}
                  className="px-4 py-1 rounded-full bg-gray-100 text-indigo-700 border border-gray-200 hover:bg-yellow-100 hover:text-yellow-700 transition-colors text-base font-bold ml-2"
                >
                  Auto-Assign Emotions
                </button>
              )}
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 rounded-full font-bold shadow transition-all duration-300 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Songs'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-10 bg-indigo-50/60 rounded-2xl p-6">
        <h4 className="text-indigo-900 font-bold mb-2">💡 Tips for better emotion matching:</h4>
        <ul className="text-base text-indigo-700 space-y-1">
          <li>• <strong className="text-yellow-700">Happy</strong> 😊: Upbeat, energetic, positive songs</li>
          <li>• <strong className="text-yellow-700">Sad</strong> 😢: Melancholic, slow, emotional songs</li>
          <li>• <strong className="text-yellow-700">Angry</strong> 😠: Aggressive, intense, powerful songs</li>
          <li>• <strong className="text-yellow-700">Surprise</strong> 😮: Unexpected, dramatic, exciting songs</li>
          <li>• <strong className="text-yellow-700">Fear</strong> 😨: Tense, suspenseful, dark songs</li>
          <li>• <strong className="text-yellow-700">Disgust</strong> 🤢: Harsh, abrasive, intense songs</li>
          <li>• <strong className="text-yellow-700">Neutral</strong> 😐: Calm, balanced, peaceful songs</li>
        </ul>
        
        <div className="mt-6 p-4 bg-white/60 rounded-xl">
          <h5 className="text-indigo-900 font-bold mb-2">📝 File Naming Tips:</h5>
          <div className="text-sm text-indigo-700 space-y-1">
            <p><strong>For auto-detection, include emotion keywords in filename:</strong></p>
            <ul className="space-y-1 mt-2">
              <li>• <code className="bg-white px-1 rounded">happy_dance_song.mp3</code> → Auto-assigns as Happy</li>
              <li>• <code className="bg-white px-1 rounded">sad_melancholy_track.mp3</code> → Auto-assigns as Sad</li>
              <li>• <code className="bg-white px-1 rounded">angry_metal_rock.mp3</code> → Auto-assigns as Angry</li>
              <li>• <code className="bg-white px-1 rounded">epic_surprise_moment.mp3</code> → Auto-assigns as Surprise</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};