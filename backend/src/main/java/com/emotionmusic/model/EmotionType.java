package com.emotionmusic.model;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum EmotionType {
    HAPPY("happy"),
    SAD("sad"),
    ANGRY("angry"),
    SURPRISE("surprise"),
    FEAR("fear"),
    DISGUST("disgust"),
    NEUTRAL("neutral");

    private final String value;

    EmotionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EmotionType fromString(String text) {
        for (EmotionType emotion : EmotionType.values()) {
            if (emotion.value.equalsIgnoreCase(text)) {
                return emotion;
            }
        }
        return NEUTRAL; // Default fallback
    }
}