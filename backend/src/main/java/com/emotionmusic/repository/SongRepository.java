package com.emotionmusic.repository;

import com.emotionmusic.model.EmotionType;
import com.emotionmusic.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    
    List<Song> findByEmotionCategory(EmotionType emotionCategory);
    
    List<Song> findByTitleContainingIgnoreCase(String title);
    
    List<Song> findByArtistContainingIgnoreCase(String artist);
    
    @Query("SELECT s FROM Song s WHERE s.emotionCategory = :emotion ORDER BY FUNCTION('RAND')")
    List<Song> findRandomSongsByEmotion(@Param("emotion") EmotionType emotion);
    
    @Query("SELECT s FROM Song s ORDER BY s.createdAt DESC")
    List<Song> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(s) FROM Song s WHERE s.emotionCategory = :emotion")
    Long countByEmotionCategory(@Param("emotion") EmotionType emotion);
}