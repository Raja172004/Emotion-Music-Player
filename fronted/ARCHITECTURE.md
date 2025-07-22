# Emotion Music Player - System Architecture

## 🏗️ Overall Architecture

The Emotion Music Player is a full-stack web application that combines real-time emotion detection with personalized music recommendations. The system follows a microservices architecture with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (DeepFace)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   MySQL         │    │   Python        │
│   localStorage  │    │   Database      │    │   Flask API     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Core Components

### 1. Frontend (React + TypeScript + Tailwind CSS)

**Location**: `/src/` (root level)

**Key Technologies**:
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **React Router** for navigation
- **Custom Hooks** for state management

**Main Components**:
```
src/
├── components/
│   ├── CameraView.tsx          # Real-time camera feed
│   ├── EmotionDisplay.tsx      # Emotion visualization
│   ├── FileUpload.tsx          # Song upload interface
│   ├── Login.tsx               # User authentication
│   ├── MusicPlayer.tsx         # Audio player with controls
│   ├── PlaylistView.tsx        # Playlist management
│   └── Register.tsx            # User registration
├── hooks/
│   ├── useBackendIntegration.ts # API communication
│   ├── useEmotionDetection.ts  # Emotion detection logic
│   ├── useLocalStorage.ts      # Local caching
│   └── useRealEmotionDetection.ts # Real-time detection
├── services/
│   └── api.ts                  # HTTP client configuration
└── types/
    └── index.ts                # TypeScript interfaces
```

**State Management**:
- **Local State**: React hooks (`useState`, `useEffect`)
- **Local Caching**: Browser localStorage for offline access
- **Real-time Updates**: WebSocket-like polling for emotion detection

### 2. Backend (Spring Boot + Java)

**Location**: `/backend/`

**Key Technologies**:
- **Spring Boot 3.x** with Java 17+
- **Spring Security** for authentication
- **Spring Data JPA** with Hibernate
- **MySQL** database
- **Maven** for dependency management

**Architecture Pattern**: **Layered Architecture**
```
backend/src/main/java/com/emotionmusic/
├── controller/          # REST API endpoints
│   ├── AuthController.java
│   ├── EmotionController.java
│   ├── PlaylistController.java
│   └── SongController.java
├── service/            # Business logic layer
│   ├── EmotionDetectionService.java
│   ├── PlaylistService.java
│   ├── SongService.java
│   └── UserService.java
├── repository/         # Data access layer
│   ├── EmotionLogRepository.java
│   ├── PlaylistRepository.java
│   ├── SongRepository.java
│   └── UserRepository.java
├── model/             # Entity classes
│   ├── EmotionLog.java
│   ├── EmotionType.java
│   ├── Playlist.java
│   ├── Song.java
│   └── User.java
├── dto/               # Data Transfer Objects
│   ├── EmotionDetectionRequest.java
│   ├── EmotionDetectionResponse.java
│   └── SongDTO.java
└── config/            # Configuration classes
    ├── SecurityConfig.java
    └── WebConfig.java
```

**Dependency Injection**: Constructor injection (no `@Autowired` on fields)

### 3. AI Service (DeepFace + Python Flask)

**Location**: `/deepface-service/`

**Key Technologies**:
- **Python Flask** for REST API
- **DeepFace** library for emotion detection
- **OpenCV** for image processing
- **Docker** containerization

**Functionality**:
- Real-time emotion analysis from camera feed
- Supports 7 emotions: happy, sad, angry, fear, surprise, disgust, neutral
- Returns confidence scores for each emotion

## 🗄️ Database Schema

**Database**: MySQL

**Tables**:
```sql
-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs table
CREATE TABLE songs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    emotion_type VARCHAR(50),
    uploaded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Playlists table
CREATE TABLE playlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Playlist songs (many-to-many relationship)
CREATE TABLE playlist_songs (
    playlist_id BIGINT,
    song_id BIGINT,
    position INT,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id),
    PRIMARY KEY (playlist_id, song_id)
);

-- Emotion logs table
CREATE TABLE emotion_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    emotion_type VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔄 Data Flow

### 1. User Authentication Flow
```
1. User enters credentials → Frontend
2. Frontend → POST /api/auth/login → Backend
3. Backend validates → Returns JWT token
4. Frontend stores token → localStorage
5. Token included in subsequent requests
```

### 2. Song Upload Flow
```
1. User selects file → Frontend
2. Frontend → POST /api/songs/upload → Backend
3. Backend saves file → uploads/songs/
4. Backend creates DB record → Returns song data
5. Frontend updates local cache → localStorage
```

### 3. Emotion Detection Flow
```
1. Camera captures frame → Frontend
2. Frontend → POST /api/emotion/detect → Backend
3. Backend → POST /detect → AI Service
4. AI Service analyzes image → Returns emotions
5. Backend logs emotion → Database
6. Backend → Returns emotion data → Frontend
7. Frontend updates UI → Emotion display
```

### 4. Music Recommendation Flow
```
1. Emotion detected → Frontend
2. Frontend → GET /api/songs?emotion={type} → Backend
3. Backend queries songs → Database
4. Backend → Returns filtered songs → Frontend
5. Frontend updates playlist → Music player
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Songs
- `GET /api/songs` - Get all songs (with optional emotion filter)
- `POST /api/songs/upload` - Upload new song
- `GET /api/songs/{id}/stream` - Stream song audio
- `DELETE /api/songs/all` - Delete all songs (admin)

### Playlists
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/{id}/songs` - Add songs to playlist
- `DELETE /api/playlists/{id}` - Delete playlist

### Emotion Detection
- `POST /api/emotion/detect` - Detect emotion from image
- `GET /api/emotion/history` - Get emotion history

## 🎨 UI/UX Architecture

### Design System
- **Color Scheme**: Gradient backgrounds with emotion-based theming
- **Typography**: Modern, readable fonts
- **Layout**: Responsive grid system
- **Components**: Reusable, modular design

### Key UI Patterns
1. **Tab Navigation**: Main sections (Camera, Upload, Playlist)
2. **Modal Dialogs**: File upload, playlist creation
3. **Real-time Updates**: Live emotion display
4. **Progressive Enhancement**: Works offline with cached data

## 🔒 Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: BCrypt encryption
- **Session Management**: Token-based sessions

### Authorization
- **Role-based Access**: User permissions
- **Resource Ownership**: Users can only access their data
- **API Protection**: Secured endpoints with authentication

### Data Protection
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: File type validation, size limits

## 🚀 Deployment Architecture

### Development Environment
```
Frontend: http://localhost:5173 (Vite dev server)
Backend:  http://localhost:8080 (Spring Boot)
Database: localhost:3306 (MySQL)
AI Service: http://localhost:5000 (Flask)
```

### Production Considerations
- **Containerization**: Docker images for each service
- **Load Balancing**: Multiple instances for scalability
- **Database**: Managed MySQL service
- **File Storage**: Cloud storage for song files
- **CDN**: Static asset delivery

## 🔧 Configuration Management

### Frontend Configuration
- **Environment Variables**: API endpoints, feature flags
- **Local Storage**: User preferences, cached data
- **Build Configuration**: Vite config for optimization

### Backend Configuration
- **application.yml**: Database, security, file upload settings
- **Profiles**: Development, production configurations
- **External Services**: AI service endpoints

## 📊 Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Caching Strategy**: localStorage for offline access
- **Image Optimization**: Compressed camera frames
- **Bundle Optimization**: Tree shaking, minification

### Backend Optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **File Streaming**: Efficient audio delivery
- **Caching**: Redis for frequently accessed data

### AI Service Optimization
- **Model Caching**: Pre-loaded DeepFace models
- **Batch Processing**: Multiple frames per request
- **Resource Management**: Memory-efficient processing

## 🐛 Error Handling & Monitoring

### Frontend Error Handling
- **Global Error Boundary**: Catches React errors
- **API Error Handling**: Network request failures
- **User Feedback**: Toast notifications, error messages

### Backend Error Handling
- **Global Exception Handler**: Consistent error responses
- **Validation Errors**: Input validation feedback
- **Logging**: Structured logging for debugging

### Monitoring
- **Health Checks**: Service availability
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Error rates, stack traces

## 🔄 State Management Strategy

### Frontend State
- **Local Component State**: UI interactions
- **Global State**: User authentication, current song
- **Persistent State**: localStorage for offline access
- **Real-time State**: WebSocket-like polling for emotions

### Backend State
- **Database State**: Persistent data storage
- **Session State**: JWT tokens, user sessions
- **File State**: Uploaded song files
- **Cache State**: Frequently accessed data

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with Jest/React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: User workflow testing

### Backend Testing
- **Unit Tests**: Service layer testing
- **Integration Tests**: Repository layer testing
- **API Tests**: Controller endpoint testing

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: Easy to replicate
- **Load Balancing**: Distribute traffic across instances
- **Database Sharding**: Partition data for performance

### Vertical Scaling
- **Resource Optimization**: Memory, CPU utilization
- **Database Optimization**: Query performance, indexing
- **Caching Strategy**: Reduce database load

## 🔄 Development Workflow

### Code Organization
- **Feature-based Structure**: Related code grouped together
- **Separation of Concerns**: Clear boundaries between layers
- **Consistent Naming**: Standardized naming conventions

### Version Control
- **Git Flow**: Feature branches, releases
- **Code Review**: Pull request process
- **Continuous Integration**: Automated testing

This architecture provides a solid foundation for a scalable, maintainable emotion-based music recommendation system with real-time capabilities and offline support. 