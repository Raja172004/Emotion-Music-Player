package com.emotionmusic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.emotionmusic.repository")
@EntityScan(basePackages = "com.emotionmusic.model")
@EnableAsync
@EnableScheduling
@RestController
public class EmotionMusicApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmotionMusicApplication.class, args);
    }

    @GetMapping("/health")
    public String health() {
        return "Backend is running!";
    }
}