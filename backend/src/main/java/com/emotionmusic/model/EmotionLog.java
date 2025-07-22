package com.emotionmusic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "emotion_logs")
public class EmotionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Detected emotion is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "detected_emotion", nullable = false)
    private EmotionType detectedEmotion;

    @DecimalMin(value = "0.0", message = "Confidence must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", message = "Confidence must be between 0.0 and 1.0")
    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "session_id")
    private String sessionId;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Constructors
    public EmotionLog() {}

    public EmotionLog(EmotionType detectedEmotion, Double confidence, String sessionId) {
        this.detectedEmotion = detectedEmotion;
        this.confidence = confidence;
        this.sessionId = sessionId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EmotionType getDetectedEmotion() { return detectedEmotion; }
    public void setDetectedEmotion(EmotionType detectedEmotion) { this.detectedEmotion = detectedEmotion; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}