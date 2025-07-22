# Emotion-Based Music Player Backend

A Spring Boot backend application that provides REST APIs for emotion-based music recommendation using real-time facial emotion detection.

## Features

- **Song Management**: Upload, store, and stream music files
- **Emotion Detection**: Real-time facial emotion analysis using DeepFace API
- **Playlist Management**: Automatic playlist generation based on detected emotions
- **Database Integration**: MySQL database for persistent storage
- **File Storage**: Local file system storage for music files
- **Security**: Basic authentication and CORS configuration
- **API Documentation**: RESTful API endpoints

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL 8.0
- **Security**: Spring Security
- **File Upload**: MultipartFile support
- **Emotion Detection**: DeepFace API integration
- **Build Tool**: Maven

## Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher
- DeepFace API service (optional, falls back to simulation)

## Setup Instructions

### 1. Database Setup

```sql
CREATE DATABASE emotion_music_db;
CREATE USER 'musicuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON emotion_music_db.* TO 'musicuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Application Configuration

Update `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/emotion_music_db
    username: your_username
    password: your_password
```

### 3. DeepFace API Setup (Optional)

Install and run DeepFace API service:

```bash
pip install deepface
python -c "
from deepface import DeepFace
from flask import Flask, request, jsonify
import base64
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    img_data = data['img']
    
    # Decode base64 image
    img_data = img_data.split(',')[1] if ',' in img_data else img_data
    img_bytes = base64.b64decode(img_data)
    img = Image.open(io.BytesIO(img_bytes))
    img_array = np.array(img)
    
    # Analyze emotion
    result = DeepFace.analyze(img_array, actions=['emotion'], enforce_detection=False)
    
    return jsonify({'results': {'0': result}})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
"
```

### 4. Build and Run

```bash
# Build the application
mvn clean package

# Run the application
mvn spring-boot:run

# Or run the JAR file
java -jar target/emotion-music-backend-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

## API Endpoints

### Song Management

- `GET /api/songs` - Get all songs
- `GET /api/songs/emotion/{emotion}` - Get songs by emotion
- `GET /api/songs/emotion/{emotion}/random` - Get random songs by emotion
- `GET /api/songs/{id}` - Get song by ID
- `POST /api/songs` - Upload new song
- `GET /api/songs/{id}/stream` - Stream song
- `GET /api/songs/{id}/download` - Download song
- `DELETE /api/songs/{id}` - Delete song
- `GET /api/songs/search?q={query}` - Search songs

### Emotion Detection

- `POST /api/emotion/detect` - Detect emotion from image
- `GET /api/emotion/statistics` - Get emotion statistics

### Playlist Management

- `GET /api/playlists/emotion/{emotion}` - Get playlist by emotion
- `POST /api/playlists/emotion/{emotion}` - Create playlist for emotion
- `POST /api/playlists/emotion/{emotion}/songs/{songId}` - Add song to playlist
- `DELETE /api/playlists/emotion/{emotion}/songs/{songId}` - Remove song from playlist

## Database Schema

### Songs Table
```sql
CREATE TABLE songs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    emotion_category ENUM('HAPPY', 'SAD', 'ANGRY', 'SURPRISE', 'FEAR', 'DISGUST', 'NEUTRAL') NOT NULL,
    file_size BIGINT,
    duration DOUBLE,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Playlists Table
```sql
CREATE TABLE playlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emotion ENUM('HAPPY', 'SAD', 'ANGRY', 'SURPRISE', 'FEAR', 'DISGUST', 'NEUTRAL') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Emotion Logs Table
```sql
CREATE TABLE emotion_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    detected_emotion ENUM('HAPPY', 'SAD', 'ANGRY', 'SURPRISE', 'FEAR', 'DISGUST', 'NEUTRAL') NOT NULL,
    confidence DOUBLE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100)
);
```

## Configuration Options

### File Upload
- Maximum file size: 10MB
- Supported formats: MP3, WAV
- Upload directory: `./uploads/songs`

### Security
- Basic authentication enabled
- CORS configured for frontend origins
- JWT token support (optional)

### Emotion Detection
- DeepFace API integration
- Fallback to simulation mode
- Configurable detection interval

## Development

### Running in Development Mode

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Testing

```bash
mvn test
```

### Building for Production

```bash
mvn clean package -Pprod
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database exists

2. **File Upload Errors**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure supported file formats

3. **Emotion Detection Not Working**
   - Check DeepFace API service status
   - Verify API endpoint configuration
   - Falls back to simulation mode if API unavailable

### Logs

Application logs are available in the console and can be configured in `application.yml`:

```yaml
logging:
  level:
    com.emotionmusic: DEBUG
    org.springframework.security: INFO
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.