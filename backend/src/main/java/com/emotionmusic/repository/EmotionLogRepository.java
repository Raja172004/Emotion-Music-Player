package com.emotionmusic.repository;

import com.emotionmusic.model.EmotionLog;
import com.emotionmusic.model.EmotionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmotionLogRepository extends JpaRepository<EmotionLog, Long> {
    
    List<EmotionLog> findBySessionIdOrderByTimestampDesc(String sessionId);
    
    List<EmotionLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT e FROM EmotionLog e WHERE e.sessionId = :sessionId AND e.timestamp >= :since ORDER BY e.timestamp DESC")
    List<EmotionLog> findRecentBySessionId(@Param("sessionId") String sessionId, @Param("since") LocalDateTime since);
    
    @Query("SELECT e.detectedEmotion, COUNT(e) FROM EmotionLog e GROUP BY e.detectedEmotion")
    List<Object[]> getEmotionStatistics();
}