package com.emotionmusic.dto;

import com.emotionmusic.model.EmotionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SongDTO {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Artist is required")
    private String artist;
    
    @NotNull(message = "Emotion category is required")
    private EmotionType emotionCategory;
    
    private String filePath;
    private Long fileSize;
    private Double duration;
    private String mimeType;

    // Constructors
    public SongDTO() {}

    public SongDTO(String title, String artist, EmotionType emotionCategory) {
        this.title = title;
        this.artist = artist;
        this.emotionCategory = emotionCategory;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public EmotionType getEmotionCategory() { return emotionCategory; }
    public void setEmotionCategory(EmotionType emotionCategory) { this.emotionCategory = emotionCategory; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
}