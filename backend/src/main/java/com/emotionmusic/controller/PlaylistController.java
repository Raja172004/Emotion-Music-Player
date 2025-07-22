package com.emotionmusic.controller;

import com.emotionmusic.dto.SongDTO;
import com.emotionmusic.model.EmotionType;
import com.emotionmusic.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @GetMapping("/emotion/{emotion}")
    public ResponseEntity<List<SongDTO>> getPlaylistByEmotion(@PathVariable String emotion) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            List<SongDTO> playlist = playlistService.getPlaylistByEmotion(emotionType);
            return ResponseEntity.ok(playlist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/emotion/{emotion}")
    public ResponseEntity<List<SongDTO>> createPlaylistForEmotion(@PathVariable String emotion) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            List<SongDTO> playlist = playlistService.createPlaylistForEmotion(emotionType);
            return ResponseEntity.ok(playlist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/emotion/{emotion}/songs/{songId}")
    public ResponseEntity<Void> addSongToPlaylist(
            @PathVariable String emotion,
            @PathVariable Long songId) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            playlistService.addSongToPlaylist(emotionType, songId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/emotion/{emotion}/songs/{songId}")
    public ResponseEntity<Void> removeSongFromPlaylist(
            @PathVariable String emotion,
            @PathVariable Long songId) {
        try {
            EmotionType emotionType = EmotionType.fromString(emotion);
            playlistService.removeSongFromPlaylist(emotionType, songId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}