package com.emotionmusic.service;

import com.emotionmusic.dto.EmotionDetectionRequest;
import com.emotionmusic.dto.EmotionDetectionResponse;
import com.emotionmusic.model.EmotionLog;
import com.emotionmusic.model.EmotionType;
import com.emotionmusic.repository.EmotionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class EmotionDetectionService {

    @Autowired
    private EmotionLogRepository emotionLogRepository;

    @Value("${app.deepface.api-url}")
    private String deepfaceApiUrl;

    @Value("${app.deepface.enabled}")
    private boolean deepfaceEnabled;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Random random = new Random();

    public EmotionDetectionResponse detectEmotion(EmotionDetectionRequest request) {
        System.out.println("=== Emotion Detection Started ===");
        System.out.println("DeepFace enabled: " + deepfaceEnabled);
        System.out.println("DeepFace API URL: " + deepfaceApiUrl);
        
        EmotionDetectionResponse response;

        if (deepfaceEnabled) {
            System.out.println("Calling DeepFace API...");
            response = callDeepFaceAPI(request);
        } else {
            System.out.println("Using simulated emotion detection...");
            response = simulateEmotionDetection(request);
        }

        System.out.println("Detected emotion: " + response.getEmotion());
        System.out.println("Confidence: " + response.getConfidence());
        System.out.println("=== Emotion Detection Completed ===");

        // Log the emotion detection
        EmotionLog log = new EmotionLog(
            response.getEmotion(),
            response.getConfidence(),
            response.getSessionId()
        );
        emotionLogRepository.save(log);

        return response;
    }

    private EmotionDetectionResponse callDeepFaceAPI(EmotionDetectionRequest request) {
        try {
            System.out.println("Preparing DeepFace API request...");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("img", request.getImageData());
            requestBody.put("actions", new String[]{"emotion"});

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            System.out.println("Sending request to DeepFace API...");
            ResponseEntity<Map> response = restTemplate.exchange(
                deepfaceApiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            System.out.println("DeepFace API response status: " + response.getStatusCode());
            System.out.println("DeepFace API response body: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> results = (Map<String, Object>) responseBody.get("results");
                
                if (results != null && !results.isEmpty()) {
                    Map<String, Object> firstResult = (Map<String, Object>) results.get("0");
                    Map<String, Double> emotions = (Map<String, Double>) firstResult.get("emotion");
                    
                    System.out.println("Raw emotions from DeepFace: " + emotions);
                    
                    // Find the emotion with highest confidence
                    String dominantEmotion = emotions.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("neutral");
                    
                    Double confidence = emotions.get(dominantEmotion);
                    // Normalize confidence to 0.0 - 1.0 range if needed
                    if (confidence != null && confidence > 1.0) {
                        confidence = confidence / 100.0;
                    }
                    
                    System.out.println("Dominant emotion: " + dominantEmotion);
                    System.out.println("Confidence: " + confidence);
                    
                    return new EmotionDetectionResponse(
                        EmotionType.fromString(dominantEmotion),
                        confidence,
                        System.currentTimeMillis(),
                        request.getSessionId()
                    );
                } else {
                    System.out.println("No results found in DeepFace response");
                }
            } else {
                System.out.println("DeepFace API returned non-OK status or null body");
            }
        } catch (Exception e) {
            System.err.println("Error calling DeepFace API: " + e.getMessage());
            e.printStackTrace();
        }

        // Fallback to simulation if API call fails
        System.out.println("Falling back to simulated emotion detection...");
        return simulateEmotionDetection(request);
    }

    private EmotionDetectionResponse simulateEmotionDetection(EmotionDetectionRequest request) {
        System.out.println("Simulating emotion detection...");
        // Simulate realistic emotion detection
        EmotionType[] emotions = EmotionType.values();
        EmotionType detectedEmotion = emotions[random.nextInt(emotions.length)];
        Double confidence = 0.7 + (random.nextDouble() * 0.3); // 70-100% confidence

        System.out.println("Simulated emotion: " + detectedEmotion);
        System.out.println("Simulated confidence: " + confidence);

        return new EmotionDetectionResponse(
            detectedEmotion,
            confidence,
            System.currentTimeMillis(),
            request.getSessionId()
        );
    }

    public Map<String, Long> getEmotionStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        // Initialize all emotions with 0
        for (EmotionType emotion : EmotionType.values()) {
            stats.put(emotion.getValue(), 0L);
        }
        
        // Get actual statistics from database
        emotionLogRepository.getEmotionStatistics().forEach(result -> {
            EmotionType emotion = (EmotionType) result[0];
            Long count = (Long) result[1];
            stats.put(emotion.getValue(), count);
        });
        
        return stats;
    }
}