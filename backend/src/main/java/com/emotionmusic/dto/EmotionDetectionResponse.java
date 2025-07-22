package com.emotionmusic.dto;

import com.emotionmusic.model.EmotionType;

public class EmotionDetectionResponse {
    private EmotionType emotion;
    private Double confidence;
    private Long timestamp;
    private String sessionId;

    // Constructors
    public EmotionDetectionResponse() {}

    public EmotionDetectionResponse(EmotionType emotion, Double confidence, Long timestamp, String sessionId) {
        this.emotion = emotion;
        this.confidence = confidence;
        this.timestamp = timestamp;
        this.sessionId = sessionId;
    }

    // Getters and Setters
    public EmotionType getEmotion() { return emotion; }
    public void setEmotion(EmotionType emotion) { this.emotion = emotion; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}