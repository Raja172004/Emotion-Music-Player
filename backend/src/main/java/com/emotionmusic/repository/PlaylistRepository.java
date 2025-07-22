package com.emotionmusic.repository;

import com.emotionmusic.model.EmotionType;
import com.emotionmusic.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    
    Optional<Playlist> findByEmotion(EmotionType emotion);
    
    boolean existsByEmotion(EmotionType emotion);
}