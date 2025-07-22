-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS emotion_music_db;
USE emotion_music_db;

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    emotion_category ENUM('HAPPY', 'SAD', 'ANGRY', 'SURPRISE', 'FEAR', 'DISGUST', 'NEUTRAL') NOT NULL,
    file_size BIGINT,
    duration DOUBLE,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_emotion_category (emotion_category),
    INDEX idx_created_at (created_at)
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emotion ENUM('HAPPY', 'SAD', 'ANGRY', 'SURPRISE', 'FEAR', 'DISGUST', 'NEUTRAL') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_emotion (emotion)
);

-- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Create emotion_logs table
CREATE TABLE IF NOT EXISTS emotion_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    detected_emotion ENUM('HAPPY', 'SAD', 'ANGRY', 'SURPRISE', 'FEAR', 'DISGUST', 'NEUTRAL') NOT NULL,
    confidence DOUBLE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    INDEX idx_session_id (session_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_detected_emotion (detected_emotion)
);

-- Insert sample data for testing
INSERT IGNORE INTO songs (title, artist, file_path, emotion_category, file_size, duration, mime_type) VALUES
('Happy Song', 'Test Artist', '/sample/happy.mp3', 'HAPPY', 3500000, 210.5, 'audio/mpeg'),
('Sad Ballad', 'Test Artist', '/sample/sad.mp3', 'SAD', 4200000, 245.2, 'audio/mpeg'),
('Angry Rock', 'Test Artist', '/sample/angry.mp3', 'ANGRY', 3800000, 195.8, 'audio/mpeg'),
('Surprise Jazz', 'Test Artist', '/sample/surprise.mp3', 'SURPRISE', 3200000, 180.3, 'audio/mpeg'),
('Fear Ambient', 'Test Artist', '/sample/fear.mp3', 'FEAR', 4500000, 320.1, 'audio/mpeg'),
('Neutral Pop', 'Test Artist', '/sample/neutral.mp3', 'NEUTRAL', 3600000, 200.7, 'audio/mpeg');

-- Create default playlists for each emotion
INSERT IGNORE INTO playlists (emotion) VALUES
('HAPPY'), ('SAD'), ('ANGRY'), ('SURPRISE'), ('FEAR'), ('DISGUST'), ('NEUTRAL');