package com.emotionmusic.controller;

import com.emotionmusic.dto.EmotionDetectionRequest;
import com.emotionmusic.dto.EmotionDetectionResponse;
import com.emotionmusic.service.EmotionDetectionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/emotion")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EmotionController {

    @Autowired
    private EmotionDetectionService emotionDetectionService;

    @PostMapping("/detect")
    public ResponseEntity<EmotionDetectionResponse> detectEmotion(
            @Valid @RequestBody EmotionDetectionRequest request) {
        try {
            System.out.println("Received emotion detection request");
            System.out.println("Image data length: " + (request.getImageData() != null ? request.getImageData().length() : "null"));
            System.out.println("Session ID: " + request.getSessionId());
            
            EmotionDetectionResponse response = emotionDetectionService.detectEmotion(request);
            System.out.println("Emotion detection successful: " + response.getEmotion());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in emotion detection: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getEmotionStatistics() {
        Map<String, Long> statistics = emotionDetectionService.getEmotionStatistics();
        return ResponseEntity.ok(statistics);
    }
}