package com.emotionmusic.dto;

import jakarta.validation.constraints.NotBlank;

public class EmotionDetectionRequest {
    @NotBlank(message = "Image data is required")
    private String imageData; // Base64 encoded image
    
    private String sessionId;

    // Constructors
    public EmotionDetectionRequest() {}

    public EmotionDetectionRequest(String imageData, String sessionId) {
        this.imageData = imageData;
        this.sessionId = sessionId;
    }

    // Getters and Setters
    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}